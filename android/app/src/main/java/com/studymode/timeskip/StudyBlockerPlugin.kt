package com.studymode.timeskip

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Capacitor Plugin Bridge connecting React frontend to Android native blocking service
 */
@CapacitorPlugin(name = "StudyBlocker")
class StudyBlockerPlugin : Plugin() {

    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences(AppBlockerAccessibilityService.PREFS_NAME, Context.MODE_PRIVATE)
    }

    @PluginMethod
    fun startBlocking(call: PluginCall) {
        val packagesArray = call.getArray("blockedPackages", JSArray())
        val subject = call.getString("activeSubject", "Focus Session") ?: "Focus Session"

        val packageSet = mutableSetOf<String>()
        for (i in 0 until packagesArray.length()) {
            val pkg = packagesArray.optString(i)
            if (pkg.isNotEmpty()) {
                packageSet.add(pkg)
            }
        }

        prefs.edit()
            .putBoolean(AppBlockerAccessibilityService.KEY_IS_BLOCKING, true)
            .putStringSet(AppBlockerAccessibilityService.KEY_BLOCKED_PACKAGES, packageSet)
            .putString(AppBlockerAccessibilityService.KEY_CURRENT_SUBJECT, subject)
            .apply()

        val ret = JSObject()
        ret.put("success", true)
        ret.put("blockedCount", packageSet.size)
        call.resolve(ret)
    }

    @PluginMethod
    fun stopBlocking(call: PluginCall) {
        prefs.edit()
            .putBoolean(AppBlockerAccessibilityService.KEY_IS_BLOCKING, false)
            .apply()

        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun checkAccessibilityPermission(call: PluginCall) {
        val ret = JSObject()
        ret.put("granted", AppBlockerAccessibilityService.isServiceRunning)
        call.resolve(ret)
    }

    @PluginMethod
    fun openAccessibilitySettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Failed to open accessibility settings: ${e.message}")
        }
    }

    @PluginMethod
    fun openUsageAccessSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Failed to open usage access settings: ${e.message}")
        }
    }

    @PluginMethod
    fun openOverlaySettings(call: PluginCall) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                call.resolve()
            } else {
                call.resolve()
            }
        } catch (e: Exception) {
            call.reject("Failed to open overlay settings: ${e.message}")
        }
    }
}
