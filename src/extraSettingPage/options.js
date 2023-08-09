import {chrome} from '../chrome';

// prettier-ignore
/**
 * Initializes the options page by setting up event listeners and
 * restoring saved options.
 */
document.addEventListener(
  'DOMContentLoaded',
  /**
   * Handles the DOMContentLoaded event to set up the options page.
   */
  function() {
    /**
     * Function to save the options in storage
     */
    function saveOptions() {
      const checkboxValue = document.getElementById('showDebugInfo').checked;

      chrome.storage.sync.set(
        {isShownExtraDebugLog: checkboxValue},
        function() {
          console.log('Options saved.');
        },
      );
    }

    /**
     * Function to restore the options from storage
     */
    function restoreOptions() {
      chrome.storage.sync.get('isShownExtraDebugLog', function(items) {
        document.getElementById('showDebugInfo').checked =
          items.isShownExtraDebugLog;
      });
    }

    /**
     * Event listeners
     */
    document
      .getElementById('showDebugInfo')
      .addEventListener('change', saveOptions);
    restoreOptions();
  },
);
