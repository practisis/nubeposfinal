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

/*import com.epson.epsonio.*;
import com.epson.eposprint.*;
import com.epson.epsonio.Finder;
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
    Handler handler = new Handler();
	static int INTENTOS=0;*/
	
	
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
		loadUrl(launchUrl);
		//super.setIntegerProperty("loadUrlTimeoutValue",70000);
        // Set by <content src="index.html" /> in config.xml
		// init printer list control
        //printerList = new ArrayList<HashMap<String, String>>();
		
		 // start find thread scheduler
        //scheduler = Executors.newSingleThreadScheduledExecutor();
        // find start
        //findStart();
		//getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN);
        //getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
		
    }
	
	 /*@Override
    public void onDestroy() {
        super.onDestroy();

        // stop find 
        if (future != null) {
            future.cancel(false);
            while (!future.isDone()) {
                try {
                    Thread.sleep(DISCOVERY_INTERVAL);
                }
                catch (Exception e) {
                    break;
                }
            }
            future = null;
        }

        if (scheduler != null) {
            scheduler.shutdown();

            scheduler = null;
        }

        // stop old finder
        while (true) {
            try {
                Finder.stop();
                break;
            }
            catch (EpsonIoException e) {
                if (e.getStatus() != IoStatus.ERR_PROCESSING) {
                    break;
                }
            }
        }
    }
	
	@Override
    // find thread 
    public void run() {
        class UpdateListThread extends Thread {
            DeviceInfo[] list = null;

            public UpdateListThread(DeviceInfo[] listDevices) {
                System.out.println("Entra a actualizar");
				INTENTOS=INTENTOS+1;
                list = listDevices;
            }

            @Override
            public void run() {
                if (list == null) {
                    if (printerList.size() > 0) {
                        printerList.clear();
                       // printerListAdapter.notifyDataSetChanged();
                    }
                }
                else if (list.length != printerList.size()) {
                    printerList.clear();

                    for (int i = 0; i < list.length; i++) {
                        String name = list[i].getPrinterName();
                        String address = list[i].getDeviceName();

                        HashMap<String, String> item = new HashMap<String, String>();
                        item.put("PrinterName", name);
                        item.put("Address", address);
                        System.out.println("Impresora: "+name+"/"+address);
                        printerList.add(item);

                    }
                    //printerListAdapter.notifyDataSetChanged();
                }
            }
        }

        try {
            DeviceInfo[] deviceList = Finder.getDeviceInfoList(FilterOption.PARAM_DEFAULT);
            handler.post(new UpdateListThread(deviceList));
        }
        catch (Exception e) {
            return;
        }
    }

    // find start / restart 
    private void findStart() {
        if (scheduler == null) {
            return;
        }

        // stop old finder 
        while (true) {
            try {
                Finder.stop();
                break;
            }
            catch (EpsonIoException e) {
                if (e.getStatus() != IoStatus.ERR_PROCESSING) {
                    break;
                }
            }
        }

        // stop find thread 
        if (future != null) {
            future.cancel(false);
            while (!future.isDone()) {
                try {
                    Thread.sleep(DISCOVERY_INTERVAL);
                }
                catch (Exception e) {
                    break;
                }
            }

            future = null;
        }

        // clear list 
        printerList.clear();
        //printerListAdapter.notifyDataSetChanged();

        try {
                //Finder.start(this,DevType.BLUETOOTH, null);
				//if(INTENTOS>10)
				Finder.start(this,DevType.BLUETOOTH, null);
        }
        catch (EpsonIoException e) {
			//errStatus = e.getStatus();
			System.out.println("status: "+e.getStatus());
			if(e.getStatus()==IoStatus.ERR_PARAM)
				System.out.println("error: Parametro invalido");
			if(e.getStatus()==IoStatus.ERR_ILLEGAL)
				System.out.println("error: El API se ha llamado cuando una busqueda ya estaba en progreso");
			if(e.getStatus()==IoStatus.ERR_PROCESSING)
				System.out.println("error: No se puede ejecutar el proceso");
			if(e.getStatus()==IoStatus.ERR_MEMORY)
				System.out.println("error: No se puede guardar en la memoria");
			if(e.getStatus()==IoStatus.ERR_FAILURE)
				System.out.println("error: Ocurrió un error inesperado");
			//future = scheduler.scheduleWithFixedDelay(this, 0, DISCOVERY_INTERVAL, TimeUnit.MILLISECONDS);
            return ;
        }
        // start thread
        future = scheduler.scheduleWithFixedDelay(this, 0, DISCOVERY_INTERVAL, TimeUnit.MILLISECONDS);
    }*/
}
