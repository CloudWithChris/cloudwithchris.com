#!/bin/bash
# content_directory ${1:-content}
subdirectories=("blog" "episode" "person" "series" "talk")

# Loop through each subfolder
for subfolder in ${subdirectories[@]}; do

  # Output the subfolder currently being looped through
  echo "Looping through ${subfolder}"

  # Find all markdown files in this directory that aren't _index.md
  for f in $(find "./content/${subfolder}" -name '*.md' | sort ); do

    # For each of them - 
    # 1. Get the path of the file (string before filename)
    # 2. Get the filename (just the name of the file.md)
    # 3. Create the new folder name by removing the .md from filename
    directory="$(dirname ${f})"
    file_name="$(basename ${f})"
    folder_name=${file_name%.md}
    section="$(basename $directory)"  # Returns the section

    images_folder="./static/img/${section}/${folder_name}"
    image_in_static_folder="./static/img/${section}/${folder_name}.*"

    if [ $file_name != "_index.md" ]; then
      # Echo the segments, for clarity in output.
      echo "Directory: ${directory} Section: ${section} File: ${file_name} New Folder: ${folder_name}"

      # Create a folder to replace the markdown file
      mkdir "${directory}/${folder_name}"
      mkdir "${directory}/${folder_name}/images"
      cp $f "${directory}/${folder_name}/index.md"

      if [ -d $images_folder ]; then
        echo "${section} ${folder_name} exists"
        mv "${images_folder}/*" "${directory}/${folder_name}/images"
      fi

      if [ -f $image_in_static_folder ]; then
        echo "${section} ${image_in_static_folder} exists"
        mv "${image_in_static_folder}/*" "${directory}/${folder_name}/images"
      fi

      rm $f
    fi

    

  done
done