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

package com.practisis.practipos;
import org.apache.cordova.*;

/*import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;*/

import android.os.Bundle;
/*import android.os.Handler;
import android.content.Context;*/

/*import com.epson.epsonio.Finder;
import com.epson.epsonio.DeviceInfo;
import com.epson.epsonio.FilterOption;
import com.epson.epsonio.DevType;
import com.epson.epsonio.EpsonIoException;
import com.epson.epsonio.IoStatus;
import com.epson.eposprint.Print;*/

//import android.view.WindowManager;


public class MainActivity extends CordovaActivity
{
	
	/*final static int DISCOVERY_INTERVAL = 500;
    ArrayList<HashMap<String, String>> printerList = null;
    ScheduledExecutorService scheduler;
    ScheduledFuture<?> future;
    final Handler mhandler = new Handler();
	static int INTENTOS=0;*/

	
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
		loadUrl(launchUrl);
		/// init printer list control
       /* printerList = new ArrayList<HashMap<String, String>>();
		// start find thread scheduler
        scheduler = Executors.newSingleThreadScheduledExecutor();
        // find start
		miHilo();*/
    }
}
