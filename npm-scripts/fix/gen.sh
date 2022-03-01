#!/usr/bin/env bash

main() {
  # Get all generated files
  # local FILES
  # FILES=()
  local SED_BACKUPS=()
  local SED_ERROR=0

  # remove openapi-generator's package and tsconfig json files
  for PKG_JSON in generated/*/package.json; do
    rm $PKG_JSON
  done
  for TSC_JSON in generated/*/tsconfig.json; do
    rm $TSC_JSON
  done

  for FILES_LIST in $(find generated/*/.openapi-generator/FILES); do
    echo FILES_LIST = $FILES_LIST
    for FILE in $(cat $FILES_LIST); do
      local DIR=$(dirname $(dirname $FILES_LIST))
      local FILE_PATH="${DIR}/${FILE}"
      echo "FILE=${FILE_PATH}"

      if test -e $FILE_PATH; then
        # Replace all occurrances of "&lt;" with "<"
        # Replace all occurrances of "&gt;" with ">"
        sed -i .bak -e 's/&lt\;/\</g' -e 's/&gt\;/\>/g' $FILE_PATH || SED_ERROR=1
        SED_BACKUPS+=( $FILE_PATH.bak )
      fi
    done
  done

  echo -e "\$SED_ERROR: $SED_ERROR \n"
  if ((SED_ERROR)); then
    echo "Error when replacing text, not deleting the backup files, please investigate: ${SED_BACKUPS[@]}"
    return 1
  else
    rm ${SED_BACKUPS[@]}
  fi


  # echo "SED_BACKUPS = ${SED_BACKUPS[@]}"
  # test build.. if build succeeds, remove backup file.

}


main $@
