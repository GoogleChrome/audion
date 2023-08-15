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
      localStorage.setItem('showExtraDebugLog', checkboxValue);
    }

    /**
     * Function to restore the options from storage
     */
    function restoreOptions() {
      document.getElementById('showDebugInfo').checked =
          localStorage.getItem('showExtraDebugLog') === 'true';
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
