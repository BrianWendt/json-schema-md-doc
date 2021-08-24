#!/bin/bash
#
# Used for refreshing the gitbook documentation from JSON schemas.
# Run this in json-schema-md-doc directory


#
# Generate entities markdown documents
#
JSON_SCHEMA_MD_DOC_DIR=$(pwd)


node samples/node/docgen.js -i ../OpenMetadata/catalog-rest-service/src/main/resources/json/schema/entity/ -o ../OpenMetadata/docs/openmetadata-apis/schemas/entities/

# Change camel case markdown file name to snake case
cd ../OpenMetadata/docs/openmetadata-apis/schemas/entities/
mv services/databaseService.md services/database-service.md
mv tags/tagCategory.md tags/tag-category.md

# Workaround - gitbook flattens the directory
mv data/*.md .
mv feed/*.md .
mv services/*.md .
mv tags/*.md .
mv teams/*.md .
mv bots.md bot.md


rm -rf data feed services tags teams

#
# Generate types markdown documents
#
cd $JSON_SCHEMA_MD_DOC_DIR
node samples/node/docgen.js -i ../OpenMetadata/catalog-rest-service/src/main/resources/json/schema/type -o ../OpenMetadata/docs/openmetadata-apis/schemas/types

# Change camel case markdown file name to snake case
cd ../OpenMetadata/docs/openmetadata-apis/schemas/types/
mv auditLog.md audit-log.md
mv dailyCount.md daily-count.md
mv entityReference.md entity-reference.md
mv entityUsage.md entity-usage.md
mv jdbcConnection.md jdbc-connection.md
mv tagLabel.md tag-label.md
mv usageDetails.md usage-details.md
rm collectionDescriptor.md
