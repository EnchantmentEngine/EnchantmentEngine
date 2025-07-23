import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { flattenObjectToArray } from '@ir-engine/common/src/utils/jsonHelperUtils'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const awsSettingPath = 'aws-setting'

  const tableExists = await knex.schema.hasTable(awsSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(awsSettingPath).first()

    if (recordExists) {
      const awsS3Settings = recordExists.s3 || {}
      const cloudfrontSettings = recordExists.cloudfront || {}
      const smsSettings = recordExists.sms || {}
      const eksSettings = recordExists.eks || {}

      const awsS3SettingConfigArray = flattenObjectToArray({ s3: JSON.parse(awsS3Settings) })
      const cloudfrontAwsConfigArray = flattenObjectToArray({ cloudfront: JSON.parse(cloudfrontSettings) })
      const smsAwsConfigArray = flattenObjectToArray({ sms: JSON.parse(smsSettings) })
      const eksAwsConfigArray = flattenObjectToArray({ eks: JSON.parse(eksSettings) })

      const awsSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Aws.S3.AccessKeyId,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.AccessKeyId)?.value ||
              process.env.STORAGE_AWS_ACCESS_KEY_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.AvatarDir,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.AvatarDir)?.value ||
              process.env.STORAGE_S3_AVATAR_DIRECTORY ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.Endpoint,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.Endpoint)?.value ||
              process.env.STORAGE_S3_ENDPOINT ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.Region,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.Region)?.value ||
              process.env.STORAGE_REGION ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.RoleArn,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.RoleArn)?.value ||
              process.env.STORAGE_AWS_ROLE_ARN ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.SecretAccessKey,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.SecretAccessKey)?.value ||
              process.env.STORAGE_AWS_ACCESS_KEY_SECRET ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.S3DevMode,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.S3DevMode)?.value ||
              process.env.STORAGE_S3_DEV_MODE ||
              ''
          },
          {
            key: EngineSettings.Aws.S3.StaticResourceBucket,
            value:
              awsS3SettingConfigArray.find((item) => item.key === EngineSettings.Aws.S3.StaticResourceBucket)?.value ||
              process.env.STORAGE_STATIC_RESOURCE_BUCKET ||
              ''
          },
          {
            key: EngineSettings.Aws.CloudFront.DistributionId,
            value:
              cloudfrontAwsConfigArray.find((item) => item.key === EngineSettings.Aws.CloudFront.DistributionId)
                ?.value ||
              process.env.STORAGE_CLOUDFRONT_DISTRIBUTION_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.CloudFront.Domain,
            value:
              cloudfrontAwsConfigArray.find((item) => item.key === EngineSettings.Aws.CloudFront.Domain)?.value ||
              process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true'
                ? process.env.APP_HOST
                : process.env.STORAGE_CDN_DOMAIN! || ''
          },
          {
            key: EngineSettings.Aws.CloudFront.Region,
            value:
              cloudfrontAwsConfigArray.find((item) => item.key === EngineSettings.Aws.CloudFront.Region)?.value ||
              process.env.STORAGE_CLOUDFRONT_REGION ||
              process.env.STORAGE_REGION ||
              ''
          },
          {
            key: EngineSettings.Aws.SMS.AccessKeyId,
            value:
              smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.AccessKeyId)?.value ||
              process.env.AWS_SMS_ACCESS_KEY_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.SMS.SecretAccessKey,
            value:
              smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.SecretAccessKey)?.value ||
              process.env.AWS_SMS_SECRET_ACCESS_KEY ||
              ''
          },

          {
            key: EngineSettings.Aws.SMS.ApplicationId,
            value:
              smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.ApplicationId)?.value ||
              process.env.AWS_SMS_APPLICATION_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.SMS.Region,
            value:
              smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.Region)?.value ||
              process.env.AWS_SMS_REGION ||
              ''
          },
          {
            key: EngineSettings.Aws.SMS.SenderId,
            value:
              smsAwsConfigArray.find((item) => item.key === EngineSettings.Aws.SMS.SenderId)?.value ||
              process.env.AWS_SMS_SENDER_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.EKS.AccessKeyId,
            value:
              eksAwsConfigArray.find((item) => item.key === EngineSettings.Aws.EKS.AccessKeyId)?.value ||
              process.env.EKS_AWS_ACCESS_KEY_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.EKS.SecretAccessKey,
            value:
              eksAwsConfigArray.find((item) => item.key === EngineSettings.Aws.EKS.SecretAccessKey)?.value ||
              process.env.EKS_AWS_ACCESS_KEY_ID ||
              ''
          },
          {
            key: EngineSettings.Aws.EKS.RoleArn,
            value:
              eksAwsConfigArray.find((item) => item.key === EngineSettings.Aws.EKS.RoleArn)?.value ||
              process.env.AWS_EKS_ROLE_ARN ||
              ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(`${item.value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'aws',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...awsSettings])
    }
  }

  await knex.schema.dropTableIfExists(awsSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
