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
      // eslint-disable-next-line
      localStorage.setItem('isShownExtraDebugLog', checkboxValue);
    }

    /**
     * Function to restore the options from storage
     */
    function restoreOptions() {
      // eslint-disable-next-line
      document.getElementById('showDebugInfo').checked = localStorage.getItem('isShownExtraDebugLog') === 'true';
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
