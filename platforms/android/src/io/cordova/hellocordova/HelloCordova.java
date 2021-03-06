/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package io.cordova.hellocordova;

import android.annotation.SuppressLint;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.webkit.WebView;
import android.widget.TextView;

import org.apache.cordova.*;

public class HelloCordova extends CordovaActivity 
{
    @SuppressLint("NewApi")
	@Override
    public void onCreate(Bundle savedInstanceState)
    {
    	getWindow().requestFeature(Window.FEATURE_ACTION_BAR);
    	//getActionBar().hide();
    	super.setBooleanProperty("showTitle", true);
        super.onCreate(savedInstanceState);
        
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        
        super.init();
        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl());
        getActionBar().hide();
        //super.loadUrl("file:///android_asset/www/index.html")
    }
}

