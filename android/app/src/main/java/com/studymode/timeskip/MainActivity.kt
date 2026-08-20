package com.studymode.timeskip

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(StudyBlockerPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
