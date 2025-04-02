#!/bin/bash
# Enhanced build script with improved error handling, logging, and structure
# Last updated: April 2, 2025

# Enable strict mode
set -euo pipefail

# Source common utility functions
source "$(dirname "$0")/common/logging.sh"
source "$(dirname "$0")/common/error-handling.sh"

###################
# Configuration
###################

# Set default values for optional environment variables
: "${BUILDER_TIMEOUT:=3600}"          # Default timeout for builder (1 hour)
: "${DOCKER_CERT_TIMEOUT:=300}"       # Default timeout for Docker cert (5 minutes)
: "${BUILD_PARALLEL:=true}"           # Default to parallel builds
: "${KEEP_IMAGES:=5}"                 # Default number of images to keep when pruning

# Record timestamps for performance tracking
START_TIME=$(date +"%Y-%m-%dT%H:%M:%S")
START_TIMESTAMP=$(date +%s)

log_info "Build process started at $START_TIME"

###################
# Validation
###################

validate_required_vars() {
  local required_vars=(
    "RELEASE_NAME"
    "DESTINATION_REPO_PROVIDER"
    "DESTINATION_REPO_URL"
    "DESTINATION_REPO_NAME_STEM"
    "STORAGE_REGION"
    "NODE_ENV"
    "TAG"
  )

  for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      log_error "Required environment variable $var is not set"
      exit 1
    else
      log_debug "Required variable $var is set to '${!var}'"
    fi
  done

  # Validate provider-specific variables
  case "$DESTINATION_REPO_PROVIDER" in
    aws)
      if [[ -z "${EKS_AWS_ACCESS_KEY_ID:-}" || -z "${EKS_AWS_ACCESS_KEY_SECRET:-}" ]]; then
        log_error "AWS provider requires EKS_AWS_ACCESS_KEY_ID and EKS_AWS_ACCESS_KEY_SECRET"
        exit 1
      fi
      ;;
    gcp)
      # Add GCP-specific validation if needed
      ;;
    *)
      log_warning "Unknown repository provider: $DESTINATION_REPO_PROVIDER"
      ;;
  esac
}

###################
# Setup Functions
###################

wait_for_docker_certs() {
  log_info "Waiting for Docker certificates..."
  
  timeout ${DOCKER_CERT_TIMEOUT} bash -c 'until [ -f /var/lib/docker/certs/client/ca.pem ]; do 
    echo "Waiting for Docker certs ($(date))"
    sleep 5
  done' || {
    log_error "Timed out waiting for Docker certificates"
    exit 1
  }
  
  log_info "Docker certificates found, setting up..."
  mkdir -pv ~/.docker
  cp -v /var/lib/docker/certs/client/* ~/.docker
  touch ./builder-started.txt
}

setup_cloud_provider() {
  log_info "Setting up cloud provider: $DESTINATION_REPO_PROVIDER"
  
  case "$DESTINATION_REPO_PROVIDER" in
    aws)
      log_info "Setting up AWS credentials and configuration"
      bash ./scripts/setup_aws.sh "$EKS_AWS_ACCESS_KEY_ID" "$EKS_AWS_ACCESS_KEY_SECRET" \
        "$STORAGE_REGION" "$CLUSTER_NAME" "${EKS_AWS_ROLE_ARN:-}"
      
      if [[ "${PRIVATE_REPO:-false}" == "true" ]]; then
        log_info "Logging into private ECR repository"
        aws ecr get-login-password --region "$STORAGE_REGION" | \
          docker login -u AWS --password-stdin "$DESTINATION_REPO_URL"
      else
        log_info "Logging into public ECR repository"
        aws ecr-public get-login-password --region us-east-1 | \
          docker login -u AWS --password-stdin "$DESTINATION_REPO_URL"
      fi
      ;;
      
    gcp)
      log_info "Setting up GCP credentials and configuration"
      # Call GCP setup script when implemented
      # bash ./scripts/setup_gcp.sh
      
      log_info "Logging into GCP Artifact Registry"
      gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
      ;;
      
    *)
      log_warning "Unknown repository provider: $DESTINATION_REPO_PROVIDER"
      ;;
  esac
}

###################
# Database and Setup Functions
###################

setup_database() {
  log_info "Setting up database environment"
  
  npx ts-node --swc scripts/check-db-exists.ts || {
    log_error "Database check failed"
    return 1
  }
  
  log_info "Preparing database"
  npm run prepare-database || {
    log_error "Database preparation failed"
    return 1
  }
  
  log_info "Creating build status"
  npm run create-build-status || {
    log_error "Build status creation failed"
    return 1
  }
}

install_projects() {
  log_info "Installing projects"
  
  npx ts-node --swc scripts/install-projects.js >project-install-build-logs.txt 2>project-install-build-error.txt || 
    npm run record-build-error -- --service=project-install
  
  if [[ -s project-install-build-error.txt ]]; then
    log_warning "Project installation had errors, recording them"
    npm run record-build-error -- --service=project-install
  else
    log_info "Projects installed successfully"
  fi
}

setup_package_environment() {
  log_info "Setting up package environment"
  
  # Create root package.json
  npx ts-node --swc scripts/create-root-package-json.ts || {
    log_error "Failed to create root package.json"
    return 1
  }
  
  # Swap package.json temporarily
  mv package.json package.jsonmoved
  mv package-root-build.json package.json
  
  # Install dependencies
  npm install || {
    log_error "Failed to install dependencies"
    # Restore original package.json
    rm -f package.json
    mv package.jsonmoved package.json
    return 1
  }
  
  # Restore original package.json
  rm -f package.json
  mv package.jsonmoved package.json
  
  # Prepare database again
  npm run prepare-database >prepare-database-build-logs.txt 2>prepare-database-build-error.txt ||
    npm run record-build-error -- --service=prepare-database
  
  if [[ -s prepare-database-build-error.txt ]]; then
    log_warning "Database preparation had errors, recording them"
    npm run record-build-error -- --service=prepare-database
  fi
  
  # Create production environment
  npx ts-node --swc packages/client/scripts/create-env-production.ts >buildenv-build-logs.txt 2>buildenv-build-error.txt ||
    npm run record-build-error -- --service=buildenv
  
  if [[ -s buildenv-build-error.txt ]]; then
    log_warning "Environment creation had errors, recording them"
    npm run record-build-error -- --service=buildenv
  fi
  
  # Set up TWA link if needed
  if [[ -n "${TWA_LINK:-}" ]]; then
    log_info "Setting up TWA Link: $TWA_LINK"
    npx ts-node --swc packages/client/scripts/populate-assetlinks.ts >populate-assetlinks-build-logs.txt 2>populate-assetlinks-build-error.txt ||
      npm run record-build-error -- --service=populate-assetlinks
    
    if [[ -s populate-assetlinks-build-error.txt ]]; then
      log_warning "Asset links population had errors, recording them"
      npm run record-build-error -- --service=populate-assetlinks
    fi
  fi
}

backup_project_packages() {
  log_info "Backing up project package.json files"
  
  mkdir -p ./project-package-jsons/projects/default-project
  cp packages/projects/default-project/package.json ./project-package-jsons/projects/default-project
  
  find packages/projects/projects/ -name package.json -exec bash -c 'mkdir -p ./project-package-jsons/$(dirname $1) && cp $1 ./project-package-jsons/$(dirname $1)' - '{}' \;
}

###################
# Build Functions
###################

build_service() {
  local service=$1
  local build_type=$2
  
  log_info "Building service: $service (type: $build_type)"
  
  local log_file="${service}-build-logs.txt"
  local error_file="${service}-build-error.txt"
  
  bash ./scripts/build_and_publish_package.sh \
    "$RELEASE_NAME" \
    "$service" \
    "$build_type" \
    "$START_TIME" \
    "$STORAGE_REGION" \
    "$NODE_ENV" \
    "$DESTINATION_REPO_PROVIDER" \
    "${PRIVATE_REPO:-false}" \
    >"$log_file" 2>"$error_file" || true
  
  npm run record-build-error -- --service="$service" --isDocker=true
  
  if [[ -s "$error_file" ]]; then
    log_warning "Service $service build had errors, see $error_file for details"
  else
    log_info "Service $service built successfully"
  fi
}

prune_aws_images() {
  local service=$1
  local region=${2:-$STORAGE_REGION}
  local public_flag=${3:-}
  
  log_info "Pruning AWS ECR images for service: $service (region: $region, public: ${public_flag:-false})"
  
  local cmd=("npx" "ts-node" "--swc" "./scripts/prune_ecr_images.ts" 
             "--repoName" "$DESTINATION_REPO_NAME_STEM-$service" 
             "--region" "$region" 
             "--service" "$service" 
             "--releaseName" "$RELEASE_NAME"
             "--keepImages" "${KEEP_IMAGES:-5}")
  
  if [[ -n "$public_flag" ]]; then
    cmd+=("--public")
  fi
  
  "${cmd[@]}" || log_warning "Failed to prune images for $service"
}

prune_gcp_images() {
  local service=$1
  local suffix=$2
  
  log_info "Pruning GCP Artifact Registry images for service: $service (suffix: $suffix)"
  
  npx ts-node --swc ./scripts/prune_gcp_ar_images.ts \
    --repoUrl "$DESTINATION_REPO_URL" \
    --repoName "$DESTINATION_REPO_NAME_STEM-$service-$suffix" \
    --packageName "$DESTINATION_PACKAGE_NAME_STEM-$service" \
    --service "$service" \
    --releaseName "$RELEASE_NAME" \
    --keepImages "${KEEP_IMAGES:-5}" || log_warning "Failed to prune images for $service"
}

determine_gcp_suffix() {
  local app_host="${APP_HOST:-}"
  local suffix=""
  
  if [[ "$app_host" =~ "preview" ]] || [[ "$app_host" =~ "mt-stg" ]]; then
    suffix="mt"
  elif [[ "$app_host" =~ "mt-rc" ]]; then
    suffix="-mt-rc"
  elif [[ "$app_host" =~ "mt-int" ]]; then
    suffix="-mt-int"
  elif [[ "$app_host" =~ "mt-qat" ]]; then
    suffix="-mt-qat"
  elif [[ "$app_host" =~ "mt" ]]; then
    suffix="-mt"
  elif [[ "$app_host" =~ "qat" ]]; then
    suffix="-qat"
  else
    suffix=""
  fi
  
  echo "$suffix"
}

###################
# Build Process
###################

build_with_storage_provider() {
  log_info "Building services (serving client from storage provider)"
  
  # Generate deletable client files list
  npx ts-node --swc scripts/get-deletable-client-files.ts || {
    log_warning "Failed to get deletable client files"
  }
  
  # Build services in parallel
  if [[ "${BUILD_PARALLEL:-true}" == "true" ]]; then
    log_info "Building services in parallel"
    build_service "api" "api" &
    build_service "client" "client-serve-static" &
    build_service "instanceserver" "instanceserver" &
    # build_service "taskserver" "taskserver" &
    
    # Wait for all background processes to finish
    wait $(jobs -p)
  else
    log_info "Building services sequentially"
    build_service "api" "api"
    build_service "client" "client-serve-static"
    build_service "instanceserver" "instanceserver"
    # build_service "taskserver" "taskserver"
  fi
  
  # Prune old images based on repo provider
  prune_repo_images "api" "client" "instanceserver" # "taskserver"
}

build_with_api_serving_client() {
  log_info "Building services (serving client from API)"
  
  # Build services in parallel
  if [[ "${BUILD_PARALLEL:-true}" == "true" ]]; then
    log_info "Building services in parallel"
    build_service "api" "api-client" &
    build_service "instanceserver" "instanceserver" &
    # build_service "taskserver" "taskserver" &
    
    # Wait for all background processes to finish
    wait $(jobs -p)
  else
    log_info "Building services sequentially"
    build_service "api" "api-client"
    build_service "instanceserver" "instanceserver"
    # build_service "taskserver" "taskserver"
  fi
  
  # Prune old images based on repo provider
  prune_repo_images "api" "instanceserver" # "taskserver"
}

build_standard() {
  log_info "Building services (standard configuration)"
  
  # Build services in parallel
  if [[ "${BUILD_PARALLEL:-true}" == "true" ]]; then
    log_info "Building services in parallel"
    build_service "api" "api" &
    build_service "client" "client" &
    build_service "instanceserver" "instanceserver" &
    # build_service "taskserver" "taskserver" &
    
    # Wait for all background processes to finish
    wait $(jobs -p)
  else
    log_info "Building services sequentially"
    build_service "api" "api"
    build_service "client" "client"
    build_service "instanceserver" "instanceserver"
    # build_service "taskserver" "taskserver"
  fi
  
  # Prune old images based on repo provider
  prune_repo_images "api" "client" "instanceserver" # "taskserver"
}

prune_repo_images() {
  local services=("$@")
  
  log_info "Pruning repository images for services: ${services[*]}"
  
  case "$DESTINATION_REPO_PROVIDER" in
    aws)
      log_info "Pruning AWS ECR images"
      
      if [[ "${PRIVATE_REPO:-false}" == "true" ]]; then
        log_info "Pruning private ECR repos in region $STORAGE_REGION"
        for service in "${services[@]}"; do
          prune_aws_images "$service" "$STORAGE_REGION"
        done
      else
        log_info "Pruning public ECR repos in region us-east-1"
        for service in "${services[@]}"; do
          prune_aws_images "$service" "us-east-1" "--public"
        done
      fi
      ;;
      
    gcp)
      log_info "Pruning GCP Artifact Registry repos"
      
      local suffix=$(determine_gcp_suffix)
      log_info "Using GCP suffix: $suffix"
      
      for service in "${services[@]}"; do
        prune_gcp_images "$service" "$suffix"
      done
      ;;
      
    *)
      log_warning "Unknown repository provider: $DESTINATION_REPO_PROVIDER, skipping pruning"
      ;;
  esac
}

###################
# Deployment Functions
###################

deploy_to_kubernetes() {
  local tag="${TAG}__${START_TIME}"
  
  log_info "Deploying to Kubernetes with tag: $tag"
  
  bash ./scripts/deploy.sh "$RELEASE_NAME" "$tag" || {
    log_error "Deployment failed"
    return 1
  }
  
  log_info "Updating cronjob image"
  npx ts-node --swc scripts/update-cronjob-image.ts \
    --repoName="${DESTINATION_REPO_NAME_STEM}" \
    --tag="${TAG}" \
    --repoUrl="${DESTINATION_REPO_URL}" \
    --startTime="${START_TIME}" || {
    log_warning "Failed to update cronjob image"
  }
}

cleanup_old_files() {
  log_info "Performing cleanup operations"
  
  log_info "Cleaning up projects rebuild"
  npx ts-node --swc scripts/clear-projects-rebuild.ts || {
    log_warning "Failed to clear projects rebuild"
  }
  
  log_info "Running builder cleanup script"
  bash ./scripts/cleanup_builder.sh || {
    log_warning "Failed to clean up builder"
  }
  
  # Delete old S3 files if using S3 for client storage
  if [[ "${SERVE_CLIENT_FROM_STORAGE_PROVIDER:-false}" == "true" && "${STORAGE_PROVIDER:-}" == "s3" ]]; then
    log_info "Deleting old client files from S3"
    npx ts-node --swc scripts/delete-old-s3-files.ts || {
      log_warning "Failed to delete old S3 files"
    }
  fi
}

record_build_success() {
  log_info "Recording build success"
  npm run record-build-success || {
    log_warning "Failed to record build success"
  }
}

handle_job_completion() {
  # Check if this is a job-based builder
  if kubectl get jobs | grep -q "$RELEASE_NAME-builder-ir-engine-builder"; then
    log_info "Job-based builder detected, terminating Docker"
    pkill dockerd || true
    pkill docker-init || true
  else
    log_info "Non-job builder, sleeping indefinitely"
    # Sleep but respond to signals
    while true; do
      sleep 3600 & wait $!
    done
  fi
}

###################
# Main Execution
###################

main() {
  # Add trap for logging execution time even if script fails
  trap 'log_perf_metrics' EXIT
  
  log_info "Starting builder with configuration:"
  log_info "  - Release name: $RELEASE_NAME"
  log_info "  - Repo provider: $DESTINATION_REPO_PROVIDER"
  log_info "  - Node environment: $NODE_ENV"
  
  # Validate required variables
  validate_required_vars
  
  # Wait for Docker certificates
  wait_for_docker_certs
  
  # Set up database and environment
  setup_database
  install_projects
  setup_package_environment
  
  # Run cleanup before build
  bash ./scripts/cleanup_builder.sh
  
  # Set up cloud provider
  setup_cloud_provider
  
  # Backup project package files
  backup_project_packages
  
  # Build services based on configuration
  if [[ "${SERVE_CLIENT_FROM_STORAGE_PROVIDER:-false}" == "true" ]]; then
    build_with_storage_provider
  elif [[ "${SERVE_CLIENT_FROM_API:-false}" == "true" ]]; then
    build_with_api_serving_client
  else
    build_standard
  fi
  
  # Deploy to Kubernetes
  deploy_to_kubernetes
  
  # Clean up and record success
  cleanup_old_files
  record_build_success
  
  # Record completion time
  DEPLOY_TIME=$(date +"%Y-%m-%dT%H:%M:%S")
  END_TIME=$(date +"%Y-%m-%dT%H:%M:%S")
  END_TIMESTAMP=$(date +%s)
  DURATION=$((END_TIMESTAMP - START_TIMESTAMP))
  
  log_info "Build process completed:"
  log_info "  - Started:  $START_TIME"
  log_info "  - Deployed: $DEPLOY_TIME"
  log_info "  - Finished: $END_TIME"
  log_info "  - Duration: $DURATION seconds"
  
  # Sleep for 3 minutes before checking job status
  sleep 3m
  
  # Handle job completion
  handle_job_completion
}

# Function to log performance metrics
log_perf_metrics() {
  local exit_code=$?
  local end_timestamp=$(date +%s)
  local duration=$((end_timestamp - START_TIMESTAMP))
  
  log_info "Build process $([[ $exit_code -eq 0 ]] && echo "succeeded" || echo "failed") after $duration seconds with exit code $exit_code"
  
  # Send metrics to your metrics collection system if available
  # Example: curl -X POST "http://metrics-collector/api/v1/build-metrics" -d "{ ... }"
}

# Run the main function
main
