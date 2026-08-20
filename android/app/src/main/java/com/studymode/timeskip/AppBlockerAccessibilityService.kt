package com.studymode.timeskip

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

/**
 * Real-Time Android OS App Blocker Accessibility Service
 * 
 * Intercepts when the user opens any unauthorized/distracting app during an active Study Mode cycle.
 * Redirects the user immediately back to Study Mode and presents the locked shield deterrent.
 */
class AppBlockerAccessibilityService : AccessibilityService() {

    companion object {
        const val PREFS_NAME = "StudyModePrefs"
        const val KEY_IS_BLOCKING = "is_blocking_active"
        const val KEY_BLOCKED_PACKAGES = "blocked_packages_set"
        const val KEY_CURRENT_SUBJECT = "current_study_subject"

        var isServiceRunning = false
            private set
    }

    private lateinit var prefs: SharedPreferences

    override fun onServiceConnected() {
        super.onServiceConnected()
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        isServiceRunning = true
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        // Only process window changes (app launches / switches)
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return

            // Never block the Study Mode app itself or System Launcher / Settings
            if (packageName == applicationContext.packageName ||
                packageName == "com.android.systemui" ||
                packageName.contains("launcher")) {
                return
            }

            val isBlockingActive = prefs.getBoolean(KEY_IS_BLOCKING, false)
            if (!isBlockingActive) return

            val blockedSet = prefs.getStringSet(KEY_BLOCKED_PACKAGES, emptySet()) ?: emptySet()

            // Check if the launched foreground app is in the restricted list
            if (blockedSet.contains(packageName)) {
                // 1. Kick user back to home
                performGlobalAction(GLOBAL_ACTION_HOME)

                // 2. Bring Study Mode to the foreground
                val launchIntent = packageManager.getLaunchIntentForPackage(applicationContext.packageName)
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    launchIntent.putExtra("BLOCKED_APP_ATTEMPT", packageName)
                    startActivity(launchIntent)
                }

                // 3. Show instant deterrent toast
                val subject = prefs.getString(KEY_CURRENT_SUBJECT, "Study")
                Toast.makeText(
                    applicationContext,
                    "⛔ Timeskip Active: $packageName is restricted during $subject focus cycle.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    override fun onInterrupt() {
        // Service interrupted by OS
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
    }
}
