/**
 * Initializes the options page by setting up event
 * listeners and restoring saved options.
 */
document.addEventListener('DOMContentLoaded', function() {
  /**
   * Logs a message to the console
   * based on whether the checkbox is checked or not.
   */
  function saveOptions() {
    const checkboxValue = document.getElementById('showDebugInfo').checked;
    /* eslint-disable */
    chrome.storage.sync.set(
      {
        isShownExtraDebugLog: checkboxValue,
      },
      function () {
        console.log('Options saved.');
      },
    );
  }

  // Function to restore the options
  function restoreOptions() {
    /* eslint-disable */
    chrome.storage.sync.get('isShownExtraDebugLog', function (items) {
      document.getElementById('showDebugInfo').checked =
        items.isShownExtraDebugLog;
    });
  }

  // Event listeners
  document
    .getElementById('showDebugInfo')
    .addEventListener('change', saveOptions);
  restoreOptions();
});
