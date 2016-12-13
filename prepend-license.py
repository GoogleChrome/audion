# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Prepends a license to source files that lack one.
"""

import os

JS_LICENSE = """
/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
""".lstrip()

HTML_LICENSE = """
<!--
Copyright 2016 Google Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
""".lstrip()

if __name__ == '__main__':
  directories = \
      ['externs', 'js', 'chrome', 'gallery', 'extension-raw-js-version']
  for directory_name in directories:
    for root, dirnames, filenames in os.walk(directory_name):
      for filename in filenames:
        if filename.endswith('.js') or filename.endswith('.css'):
          license_string = JS_LICENSE
        elif filename.endswith('.html'):
          license_string = HTML_LICENSE
        else:
          # We lack a license for this file.
          continue
        file_location = os.path.join(root, filename)
        readable = open(file_location)
        contents = readable.read()
        readable.close()
        if 'Licensed under the Apache License, Version 2.0' in contents:
          # This file already has a license block. Do not give it another one.
          continue

        writeable = open(file_location, 'w+')
        writeable.write(license_string)
        writeable.write(contents)
        writeable.close()
