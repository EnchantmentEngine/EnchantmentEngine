//s3.putObject has an upper limit on file size before it starts erroring out. On paper the limit is around 5 GB, but
//in practice, errors were seen at around 2 GB. Setting the limit to 1 GB for safety; above this, files will be
//uploaded via multipart upload instead of a single putObject operation. Part size is set to 100 MB.
//nodejs has an upper limit of 1 or 2 GB on direct file reads and writes (32-bit and 64-bit systems, respectively).
//1 GB is the cutoff for using read/write streams for those as well for consistency
export const MULTIPART_CUTOFF_SIZE = 1000 * 1000 * 1000
export const MULTIPART_CHUNK_SIZE = 100 * 1000 * 1000
