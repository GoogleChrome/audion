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
goog.provide('audion.messaging.NodePropertyType');


/**
 * Enumerates types of properties of AudioNodes. These values are used within
 * AudionPropertyValuePair messages, which are routed to dev tools in order to
 * update the properties of nodes shown to the user.
 * Increment this value upon adding a new value - next available value: 9
 * @enum {number}
 */
audion.messaging.NodePropertyType = {
  AUDIO_PARAM: 1,
  READ_ONLY: 2,
  MUTABLE_BOOLEAN: 3,
  MUTABLE_NUMBER: 4,
  MUTABLE_OBJECT: 5,
  ENUM: 6,
  BUFFER_MUTABLE_NUMBER: 7,
  BUFFER_READ_ONLY: 8
};
