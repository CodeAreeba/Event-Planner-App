const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Config plugin to add WhatsApp queries to AndroidManifest.xml
 * This is required for Android 11+ to allow the app to detect and open WhatsApp
 */
const withWhatsAppQueries = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest;

    // Add queries element if it doesn't exist
    if (!mainApplication.queries) {
      mainApplication.queries = [];
    }

    // Ensure queries is an array
    if (!Array.isArray(mainApplication.queries)) {
      mainApplication.queries = [mainApplication.queries];
    }

    // Check if WhatsApp package query already exists
    const hasWhatsAppPackage = mainApplication.queries.some(
      (query) =>
        query.package &&
        query.package.some((pkg) => pkg.$["android:name"] === "com.whatsapp")
    );

    // Add WhatsApp package query if not present
    if (!hasWhatsAppPackage) {
      mainApplication.queries.push({
        package: [
          {
            $: {
              "android:name": "com.whatsapp",
            },
          },
        ],
      });
    }

    // Check if intent filter for wa.me already exists
    const hasWaMeIntent = mainApplication.queries.some(
      (query) =>
        query.intent &&
        query.intent.some((intent) =>
          intent.data?.some(
            (data) =>
              data.$["android:scheme"] === "https" &&
              data.$["android:host"] === "wa.me"
          )
        )
    );

    // Add intent filter for https://wa.me links
    if (!hasWaMeIntent) {
      mainApplication.queries.push({
        intent: [
          {
            action: [
              {
                $: {
                  "android:name": "android.intent.action.VIEW",
                },
              },
            ],
            data: [
              {
                $: {
                  "android:scheme": "https",
                  "android:host": "wa.me",
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

module.exports = withWhatsAppQueries;
