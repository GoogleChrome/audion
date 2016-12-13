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
goog.provide('audion.entryPoints.ExtensionTag.FromTracing');
goog.provide('audion.entryPoints.ExtensionTag.ToTracing');


/**
 * The value of the tag field for every relevant message posted by the tracing
 * code. Messages from the page that lack a tag property of this value are not
 * relevant to this extension, and we may ignore them. This is a number randomly
 * generated from 0 to the largest signed int. It is a number to allow for fast
 * comparison.
 * @const {number}
 */
audion.entryPoints.ExtensionTag.FromTracing = 823710097;


/**
 * The value of the tag field for every relevant message posted *to* the tracing
 * code from the background script. We need 2 of them to differentiate between
 * messages.
 * @const {number}
 */
audion.entryPoints.ExtensionTag.ToTracing = 934445323;

