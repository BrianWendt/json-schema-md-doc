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
mv auditLog.md auditlog.md
mv dailyCount.md dailycount.md
mv entityReference.md entityreference.md
mv entityUsage.md entityusage.md
mv jdbcConnection.md jdbcconnection.md
mv tagLabel.md taglabel.md
mv usageDetails.md usagedetails.md
rm collectionDescriptor.md
