package com.uforge.plugins;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.text.SimpleDateFormat;
import java.text.DecimalFormat;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;

import com.starmicronics.stario.StarIOPortException;
import com.starmicronics.stario.StarPrinterStatus;
import com.starmicronics.stario.PortInfo;
import com.starmicronics.stario.StarIOPort;
import com.uforge.plugins.RasterDocument.RasPageEndMode;
import com.uforge.plugins.RasterDocument.RasSpeed;
import com.uforge.plugins.RasterDocument.RasTopMargin;
import com.uforge.plugins.StarBitmap;

/**
 * @author Luca Del Bianco
 * This class handles the basic printing functions needed to print using the Star SDK
 */
public class StarIOAdapter extends CordovaPlugin {
	
	public enum RasterCommand {
		Standard, Graphics
	};
	
	private static int printableArea = 576;
	
    /* (non-Javadoc)
     * @see org.apache.cordova.CordovaPlugin#execute(java.lang.String, org.json.JSONArray, org.apache.cordova.CallbackContext)
     */
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        final StarIOAdapter currentPluginInstance = this;
        final JSONArray Arguments = args;
        final CallbackContext currentCallbackContext = callbackContext;

        if (action.equals("check")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {

                        if(Arguments.length() < 1) {
                            throw new Exception("You must specify a portName search parameter");
                        }

                        currentPluginInstance.check(currentCallbackContext, Arguments.getString(0));
                    } catch (Exception e) {
                        currentCallbackContext.error(e.getMessage());
                    }
                }
            });
            return true;
        } else if (action.equals("rawprint")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        String portSettings = "";

                        if(Arguments.length() < 2) {
                            throw new Exception("You must specify a portName search parameter");
                        }

                        if(Arguments.length() == 3) {
                            portSettings = Arguments.getString(2);
                        }
						
                        currentPluginInstance.rawPrint(currentCallbackContext, Arguments.getString(0), Arguments.getString(1), portSettings);
                    } catch (Exception e) {
                        currentCallbackContext.error(e.getMessage());
                    }
                }
            });
            return true;
        } else if (action.equals("searchall")) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        if(Arguments.length() < 1) {
                            throw new Exception("You must specify a portName search parameter");
                        }
                        currentPluginInstance.searchAll(currentCallbackContext, Arguments.getString(0));
                    } catch (Exception e) {
                        currentCallbackContext.error(e.getMessage());
                    }
                }
            });
            return true;
        }
        return false;
    }

    /**
     * This method check the status of the first paired device (we assume it's a printer) and returns "OK" to the phonegap plugin if it's online
     * @param callbackContext the callback context of the action
     */
    private void check(CallbackContext callbackContext, String portNameSearch) {
        String portName = "";
        String portSettings = "";
        Context context = this.cordova.getActivity().getApplicationContext();

        portName = PrinterFunctions.getFirstPrinter(portNameSearch,context);

        try {
            StarPrinterStatus status = PrinterFunctions.GetStatus(context, portName, portSettings, true);
            if (status == null) {
                callbackContext.error("Cannot get the printer status.");
            } else if (status.offline) {
                callbackContext.error("The printer is offline.");
            } else {
                callbackContext.success();
            }
        } catch (StarIOPortException e) {
            callbackContext.error(e.getMessage());
        }
    }

    /**
     * This method sends a print command to the printer using the first available paired device (we assume it is a printer)
     * @param callbackContext the callback context of the action
     * @param message the string containing all the content to print
     * @param portSettings the port settings for the connection to the printer ("mini" if you are printing on star portable printers)
     */
    private void rawPrint(CallbackContext callbackContext, String message, String portNameSearch, String portSettings) throws StarIOPortException {
        String portName = "";
        Context context = this.cordova.getActivity().getApplicationContext();
			
        //byte[] data;
        //ArrayList<byte[]> list = new ArrayList<byte[]>();
        //Byte[] tempList;
		

        portName = PrinterFunctions.getFirstPrinter(portNameSearch,context);

       // data = message.getBytes();
        //tempList = new Byte[data.length];
		
		/*sacadatos del json*/
		String cedulaCliente="";
		String nombreCliente="";
		String direccionCliente="";
		String telefonoCliente="";
		String nombreEmpresa="";
		String direccionEmpresa="";
		String telefonoEmpresa="";
		JSONArray expprod=new JSONArray();
		JSONArray expago=new JSONArray();
		String subconiva="0.00";
		String subsiniva="0.00";
		String totalfact="0.00";
		String subtotal="0.00";
		String iva="0.00";
		String servicio="0.00";
		String descuento="0.00";
		String ordername="";
		String nofact="";
		SimpleDateFormat hoyformat=new SimpleDateFormat("MM-dd-yyyy HH:mm:ss");
		String hoy= hoyformat.format(new Date());
		String tipo="";
		String fechaCierre="";
		String fechaImpresion="";
		String numeroFacturas="";
		String anuladas="0";
		String subtotalCierre="0.00";
		String descuentoCierre="0.00";
		String subdes="0.00";
		String servicioCierre="0.00";
		String totalCierre="0.00";
		String ivaCierre="0.00";
		String cadimpuestos="";
		JSONArray cierreImpuestos= new JSONArray();
		Integer lineastotales=30; //18cm-2lineas
		Integer lineasencabezado=0; //3cm-2lineas
		long fechanumber=0;
		JSONArray expformas=new JSONArray();
		String textoreimpr="";
		if(message.contains("reimpr")){
			message=message.replace("reimpr","");
			textoreimpr="Reimpresion Factura "+hoy;
		}
		
		
		try{
			JSONObject jsonobject = new JSONObject(message);
			JSONArray nombres=jsonobject.names();
			if(nombres.toString().contains("Pagar")){
			JSONArray jsonArray = jsonobject.getJSONArray("Pagar");
			JSONObject expjson=jsonArray.getJSONObject(0);
			JSONObject objcliente=expjson.getJSONObject("cliente");
			JSONObject objfactura=expjson.getJSONObject("factura");
			JSONObject objempresa=expjson.getJSONObject("empresa");
			expago=expjson.getJSONArray("pagos");
			expprod=expjson.getJSONArray("producto");
			//expprod=objproducto.getJSONArray("0");
			
			cedulaCliente=objcliente.getString("cedula");
			nombreCliente=objcliente.getString("nombre");
			telefonoCliente=objcliente.getString("telefono");
			direccionCliente=objcliente.getString("direccion");
			subconiva=DoubleFormat(objfactura.getDouble("subtotal_iva"));
			//iva=DoubleFormat(objfactura.getDouble("subtotal_iva")*0.12);
			iva=DoubleFormat(objfactura.getDouble("iva"));
			servicio=DoubleFormat(objfactura.getDouble("servicio"));
			subsiniva=DoubleFormat(objfactura.getDouble("subtotal_sin_iva"));
			subtotal=DoubleFormat(objfactura.getDouble("subtotal_sin_iva")+objfactura.getDouble("subtotal_iva"));
			descuento=DoubleFormat(objfactura.getDouble("descuento"));
			totalfact=DoubleFormat(objfactura.getDouble("total"));
			nofact=objfactura.getString("numerofact");
			nombreEmpresa=objempresa.getString("nombre");
			direccionEmpresa=objempresa.getString("direccion");
			fechanumber=(long)objfactura.getDouble("fecha");
			lineastotales=(2*objfactura.getInt("largo"))-6;
			lineasencabezado=(2*objfactura.getInt("encabezado"))-6;
			if(objfactura.has("impuestosdata")){
				if(!(objfactura.getString("impuestosdata").equals(JSONObject.NULL)))
					cadimpuestos=objfactura.getString("impuestosdata");
			}
			if(objfactura.has("ordername")){
				if(!(objfactura.getString("ordername").equals(JSONObject.NULL)))
				ordername=objfactura.getString("ordername");
			}
			
			tipo="pagar";
			}else if(nombres.toString().contains("Cierre")){
				tipo="cierre";
				JSONArray jsonArrayc = jsonobject.getJSONArray("Cierre");
				JSONObject expjson=jsonArrayc.getJSONObject(0);
				fechaCierre=expjson.getString("fecha_caja");
				fechaImpresion=expjson.getString("fecha_imp");
				numeroFacturas=expjson.getString("num_facts");
				anuladas=expjson.getString("fact_anuladas");
				numeroFacturas=expjson.getString("num_facts");
				subtotalCierre=expjson.getString("subtotal");
				ivaCierre=expjson.getString("iva");
				totalCierre=expjson.getString("total");
				servicioCierre=expjson.getString("servicio");
				descuentoCierre=expjson.getString("descuento");
				subdes=expjson.getString("subdesc");
				expformas=expjson.getJSONArray("formaspago");
				if(!(expjson.getJSONArray("impuestos").equals(JSONObject.NULL)))
					cierreImpuestos=expjson.getJSONArray("impuestos");
				//{"Cierre": [{"fecha_caja":"2015-12-17","fecha_imp":"2015-12-17","num_facts":"1","fact_anuladas":"0","subtotal":"3.13","iva":"0.38","total":"3.50","formaspago":[{"Efectivo":"3.50","Tarjetas":"0.00","Cheques":"0.00","CxC":"0.00"}]}]}
			}
			
		}catch(JSONException ex){

			ex.printStackTrace();
		}
		
		/*
		JSONObject expjson=jsonArray.getJSONObject(0);
		JSONObject objcliente=expjson.getJSONObject("cliente");*/
		/**/
		String needle="USB:";
		if(!portNameSearch.toLowerCase().contains(needle.toLowerCase())){
				ArrayList<byte[]> list = new ArrayList<byte[]>();
				
				list.add(new byte[] { 0x1b, 0x1d, 0x74, 0x20 }); // Code Page #1252 (Windows Latin-1)

				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 }); // Alignment (center)

				// list.add("[If loaded.. Logo1 goes here]\r\n".getBytes());

				// list.add(new byte[]{0x1b, 0x1c, 0x70, 0x01, 0x00, '\r', '\n'}); //Stored Logo Printing

				// Notice that we use a unicode representation because that is
				// how Java expresses these bytes as double byte unicode

				// Character expansion
				list.add(new byte[] { 0x06, 0x09, 0x1b, 0x69, 0x01, 0x01 });
				
			if(tipo.equals("pagar")){
					
				list.add(createCp1252(nombreEmpresa+"\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(createCp1252(direccionEmpresa+"-"+telefonoEmpresa+"\r\n"));
				//list.add(createCp1252("08029 BARCELONA\r\n\r\n"));
				
				list.add(createCp1252(nombreCliente+"-"+cedulaCliente+"\r\n"));
				list.add(createCp1252(direccionCliente+"/"+telefonoCliente+"\r\n"));
				if(textoreimpr!=""){
					list.add(createCp1252(textoreimpr+"\r\n"));
				}
					
				list.add(createCp1252("--------------------------------\r\n"));

				//list.add(createCp1252("TEL :934199465\r\n"));
				
				//list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment

				list.add(new byte[] { 0x1b, 0x44, 0x02, 0x10, 0x22, 0x00 }); // Set horizontal tab

				
				
				//list.add(createCp1252("MESA: 100 P: - FECHA: YYYY-MM-DD\r\n"));
			
				Date fechafact=new Date(fechanumber);
				//String fechaf=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(fechafact);
				String fechaf=new SimpleDateFormat("MM-dd-yyyy HH:mm:ss").format(fechafact);
				
				list.add(createCp1252("NO:"+nofact+"                   \r\n"));
				list.add(createCp1252("FECHA:"+fechaf+"                   \r\n"));
				

				
				
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 }); // Alignment (center)
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("  # DESCRIPCION             SUMA\r\n"));
				if(expprod.length()>0){
					for(int i=0;i<expprod.length();i++){
						try{
						JSONObject linea=expprod.getJSONObject(i);
						String cantidad=linea.getString("cant_prod");
						if(cantidad.length()<3){
							int tam=3-cantidad.length();
							for(int n=0;n<tam;n++){
								cantidad=" "+cantidad;
							}
						}
						
						String totc=DoubleFormat((linea.getDouble("precio_orig")+linea.getDouble("agregados"))*linea.getDouble("cant_prod"));
						//String totc=String.valueOf(total);
						if(totc.length()<6){
							int tam=6-totc.length();
							for(int n=0;n<tam;n++){
								totc=" "+totc;
							}
						}
						
						String desc=linea.getString("nombre_producto");
						if(desc.length()>21)
							desc=desc.substring(0,21);
						else if(desc.length()<21){
							int tam=21-desc.length();
							for(int n=0;n<tam;n++){
								desc=desc+" ";
							}
						}
												
						
						list.add(createCp1252(String.valueOf(cantidad)+" "+String.valueOf(desc)+" "+String.valueOf(totc)+"\r\n"));
						
						/**/
						if(!(linea.getString("detalle_agregados").equals(JSONObject.NULL))){
							if(!(linea.getString("detalle_agregados").equals(""))){
								String [] agregadosv=linea.getString("detalle_agregados").split("@");
								for(int s=0;s<agregadosv.length;s++){
									String [] detalleagr=agregadosv[s].split("\\|");
									String valorag=DoubleFormat(Double.parseDouble(detalleagr[1]));
									String cadena="    "+detalleagr[0]+": $"+valorag;
									if(cadena.length()<32){
										int tam=32-cadena.length();
										for(int n=0;n<tam;n++){
											cadena=cadena+" ";
										}
									}
									list.add(createCp1252(cadena+"\r\n"));
								}
							}
						}
						/**/
						
						//list.add(createCp1252(" 4  3,00  JARRA  CERVESA   12,00\r\n"));
						//list.add(createCp1252(" 1  1,60  COPA DE CERVESA   1,60\r\n"));
						}catch(JSONException ex){
							ex.printStackTrace();
						}
					}
					
				}
				
				list.add(createCp1252("--------------------------------\r\n"));
				
						if(subconiva.length()<6){
							int tam=6-subconiva.length();
							for(int n=0;n<tam;n++){
								subconiva=" "+subconiva;
							}
						}
				
						if(subsiniva.length()<6){
							int tam=6-subsiniva.length();
							for(int n=0;n<tam;n++){
								subsiniva=" "+subsiniva;
							}
						}
						
						if(subtotal.length()<6){
							int tam=6-subtotal.length();
							for(int n=0;n<tam;n++){
								subtotal=" "+subtotal;
							}
						}
						
						if(iva.length()<6){
							int tam=6-iva.length();
							for(int n=0;n<tam;n++){
								iva=" "+iva;
							}
						}
						
						if(totalfact.length()<6){
							int tam=6-totalfact.length();
							for(int n=0;n<tam;n++){
								totalfact=" "+totalfact;
							}
						}
						
						if(iva.length()<6){
							int tam=6-iva.length();
							for(int n=0;n<tam;n++){
								iva=" "+iva;
							}
						}
						
						if(servicio.length()<6){
							int tam=6-servicio.length();
							for(int n=0;n<tam;n++){
								servicio=" "+servicio;
							}
						}
						
						if(descuento.length()<6){
							int tam=6-descuento.length();
							for(int n=0;n<tam;n++){
								descuento=" "+descuento;
							}
						}
						
				if(Double.parseDouble(subtotal.replace(",","."))>0){
					list.add(createCp1252("                 SUBTOTAL:"+String.valueOf(subtotal)+"\r\n"));
				}
				/*if(Double.parseDouble(subconiva.replace(",","."))>0){
					list.add(createCp1252("                SUBCONIVA:"+String.valueOf(subconiva)+"\r\n"));
				}
				if(Double.parseDouble(subsiniva.replace(",","."))>0){
					list.add(createCp1252("                SUBSINIVA:"+String.valueOf(subsiniva)+"\r\n"));
				}*/
				
				/*imprime impuestos*/
				if(!cadimpuestos.equals("")){
					String[] imps = cadimpuestos.split("@");
					for(int k=0;k<imps.length;k++){
						if(!(imps[k].equals(""))){
							String [] dataimp=imps[k].split("\\|");
							if(Double.parseDouble(dataimp[3].replace(",","."))>0.00){
								String porcen=DoubleFormat(Double.parseDouble(dataimp[2])*100);
								String nombreimp=dataimp[1]+" "+porcen+"%:";
								String valorimp=DoubleFormat(Double.parseDouble(dataimp[3].replace(",",".")));
								if(valorimp.length()<6){
									int tam=6-valorimp.length();
									for(int n=0;n<tam;n++){
										valorimp=" "+valorimp;
									}
								}
								
								if(nombreimp.length()<26){
									int tam=26-nombreimp.length();
									for(int n=0;n<tam;n++){
										nombreimp=" "+nombreimp;
									}
								}
								
								list.add(createCp1252(String.valueOf(nombreimp)+String.valueOf(valorimp)+"\r\n"));
								//lineasescritas=lineasescritas+1;
							}
						}
						
					}
				}else{
					if(Double.parseDouble(iva.replace(",","."))>0){
						list.add(createCp1252("                      IVA:"+String.valueOf(iva)+"\r\n"));
						//lineasescritas=lineasescritas+1;
					}
					if(Double.parseDouble(servicio.replace(",","."))>0){
						list.add(createCp1252("                 SERVICIO:"+String.valueOf(servicio)+"\r\n"));
						//lineasescritas=lineasescritas+1;
					}
				}
				/*fin impuestos*/

				/*if(Double.parseDouble(iva.replace(",","."))>0){
					list.add(createCp1252("                      IVA:"+String.valueOf(iva)+"\r\n"));
				}
				if(Double.parseDouble(servicio.replace(",","."))>0){
					list.add(createCp1252("                 SERVICIO:"+String.valueOf(servicio)+"\r\n"));
				}*/
				if(Double.parseDouble(descuento.replace(",","."))>0){
					list.add(createCp1252("                DESCUENTO:"+String.valueOf(descuento)+"\r\n"));
				}
				
				//list.add(new byte[] { 0x09, 0x1b, 0x69, 0x01, 0x00 });
				//list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x02 });

				// Character expansion
				list.add(new byte[] { 0x06, 0x09, 0x1b, 0x69, 0x01, 0x01 });
				list.add(createCp1252("                TOTAL:"+String.valueOf(totalfact)+"\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				
				//formas de pago
				if(expago.length()>0){
					
					list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment
					list.add(createCp1252("Pagado:\r\n"));
					String forma="";
					String elvuelto="0.00";
					for(int i=0;i<expago.length();i++){
						try{
						JSONObject linea=expago.getJSONObject(i);
						Double valor=linea.getDouble("valor");
						Double vuelto=0.00;
						if(valor<0){
							vuelto=-1*valor;
						}
						else{
							forma=linea.getString("forma")+":"+DoubleFormat(valor);
							list.add(createCp1252(forma+"\r\n"));
						}
							
						elvuelto=DoubleFormat(vuelto);
						
						}catch(JSONException ex){
							ex.printStackTrace();
						}
					}
					list.add(createCp1252("Vuelto:"+String.valueOf(elvuelto)+"\r\n"));
				}
				
			}else if(tipo.equals("cierre")){
				
				if(subtotalCierre.length()<9){
					int tam=9-subtotalCierre.length();
						for(int n=0;n<tam;n++){
							subtotalCierre=" "+subtotalCierre;
						}
				}
						
				if(ivaCierre.length()<9){
					int tam=9-ivaCierre.length();
						for(int n=0;n<tam;n++){
								ivaCierre=" "+ivaCierre;
						}
				}
				
				if(descuentoCierre.length()<9){
					int tam=9-descuentoCierre.length();
						for(int n=0;n<tam;n++){
								descuentoCierre=" "+descuentoCierre;
						}
				}
				
				if(servicioCierre.length()<9){
					int tam=9-servicioCierre.length();
						for(int n=0;n<tam;n++){
								servicioCierre=" "+servicioCierre;
						}
				}
				
				if(totalCierre.length()<9){
					int tam=9-totalCierre.length();
						for(int n=0;n<tam;n++){
								totalCierre=" "+totalCierre;
						}
				}
						
				list.add(createCp1252("CIERRE DE CAJA\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("  FECHA IMP.:"+fechaImpresion+"\r\n"));
				list.add(createCp1252("FECHA CIERRE:"+fechaCierre+"\r\n"));
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("FACTURAS\r\n"));
				if(numeroFacturas.length()<9){
								int tam=9-numeroFacturas.length();
									for(int n=0;n<tam;n++){
											numeroFacturas=" "+numeroFacturas;
									}
							}
				
				if(anuladas.length()<9){
					int tam=9-anuladas.length();
					for(int n=0;n<tam;n++){
							anuladas=" "+anuladas;
						}
				}
				
				list.add(createCp1252("No. Facturas    "+numeroFacturas+"\r\n"));
				list.add(createCp1252("No. Anuladas    "+anuladas+"\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("TOTALES\r\n"));
				list.add(createCp1252("Subtotal        "+subtotalCierre+"\r\n"));
				
				/*impuestos*/
				if(cierreImpuestos.length()>0){
					try{
						JSONObject linea2=cierreImpuestos.getJSONObject(0);
						//String [] names=JSONObject.getNames(linea);
						Iterator key2 = linea2.keys();
						while (key2.hasNext()) {
							String nombre2 = key2.next().toString();
							String valor2=linea2.getString(nombre2);
							
							if(valor2.length()<9){
								int tam=9-valor2.length();
									for(int n=0;n<tam;n++){
											valor2=" "+valor2;
									}
							}
							
							if(nombre2.length()<15){
								int tam=15-nombre2.length();
									for(int n=0;n<tam;n++){
											nombre2=nombre2+" ";
									}
							}
							list.add(createCp1252(String.valueOf(nombre2)+" "+String.valueOf(valor2)+"\r\n"));
						}
					}catch(JSONException ex){
						ex.printStackTrace();
					}
				}
				else{
					list.add(createCp1252("Iva             "+ivaCierre+"\r\n"));
					list.add(createCp1252("Servicio        "+servicioCierre+"\r\n"));
				}
				
				/**/
				list.add(createCp1252("Descuentos      "+descuentoCierre+"\r\n"));
				list.add(createCp1252("TOTAL           "+totalCierre+"\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("FORMAS DE PAGO\r\n"));
				if(expformas.length()>0){
						try{
						JSONObject linea=expformas.getJSONObject(0);
						//String [] names=JSONObject.getNames(linea);
						Iterator key = linea.keys();
						while (key.hasNext()) {
							String nombre = key.next().toString();
							String valor=linea.getString(nombre);
							
							if(valor.length()<9){
								int tam=9-valor.length();
									for(int n=0;n<tam;n++){
											valor=" "+valor;
									}
							}
							
							if(nombre.length()<15){
								int tam=15-nombre.length();
									for(int n=0;n<tam;n++){
											nombre=nombre+" ";
									}
							}
							
							list.add(createCp1252(String.valueOf(nombre)+" "+String.valueOf(valor)+"\r\n"));
						}
						/*for(int m=0;m<names.length();m++)
						{
							String nombre=names[m];
							String valor=linea.getString(names[m]);
							list.add(createCp1252(String.valueOf(nombre)+":"+String.valueOf(valor)+"\r\n"));
						}	*/					
						}catch(JSONException ex){
								ex.printStackTrace();
						}
				}
			}
				//list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });
				//list.add(new byte[] { 0x09, 0x1b, 0x69, 0x00, 0x00 });
				

				//list.add(createCp1252("NO: 000018851     IVA IXNCLUIDO\r\n"));
				list.add(createCp1252("--------------------------------\r\n"));

				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 });
				list.add(createCp1252("*Orden para: "+ordername+"*\r\n"));
				list.add(createCp1252("**** PRACTIPOS ****\r\n"));
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });

				// 1D barcode example
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 });
				list.add(new byte[] { 0x1b, 0x62, 0x06, 0x02, 0x02 });

				list.add(createCp1252(" 12ab34cd56\u001e\r\n"));

				list.add(new byte[] { 0x1b, 0x64, 0x02 }); // Cut
				list.add(new byte[] { 0x07 }); // Kick cash drawer
				try {
					PrinterFunctions.SendCommand(context, portName, portSettings, list);
					callbackContext.success();
				} catch (StarIOPortException e) {
					callbackContext.error(e.getMessage());
				}
				
		}else{
			ArrayList<byte[]> list = new ArrayList<byte[]>();
			if(tipo.equals("pagar")==true){
				
				Integer lineasescritas=0;
				
				list.add(new byte[] { 0x1b, 0x1d, 0x74, 0x20 }); // Code Page #1252 (Windows Latin-1)

				list.add(new byte[] { 0x1b, 0x44, 0x02, 0x06, 0x0a, 0x10, 0x14, 0x1a, 0x22, 0x24, 0x28, 0x00 }); // Set horizontal tab

				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 }); // Alignment (center)

				// list.add("[If loaded.. Logo1 goes here]\r\n".getBytes());

				// list.add(new byte[]{0x1b, 0x1c, 0x70, 0x01, 0x00, '\r', '\n'}); //Stored Logo Printing

				// Notice that we use a unicode representation because that is
				// how Java expresses these bytes as double byte unicode

				// Character expansion
				//list.add(new byte[] { 0x1b, 0x68, 0x01 });

				//list.add(createCp1252(nombreEmpresa+"\r\n")); lineasescritas=lineasescritas+1;
				//list.add(new byte[] { 0x1b, 0x68, 0x00 }); // Cancel Character Expansion
				//list.add(createCp1252(direccionEmpresa+"\r\n")); lineasescritas=lineasescritas+1;
				//list.add(createCp1252("08029 BARCELONA\r\n\r\n"));
				
				while(lineasescritas<lineasencabezado){
					list.add(createCp1252("\r\n"));
					lineasescritas=lineasescritas+1;
				}
				
				list.add(createCp1252(nombreCliente+"-"+cedulaCliente+"\r\n")); lineasescritas=lineasescritas+1;
				list.add(createCp1252(direccionCliente+"/"+telefonoCliente+"\r\n")); lineasescritas=lineasescritas+1;
				if(textoreimpr!=""){
					list.add(createCp1252(textoreimpr+"\r\n")); lineasescritas=lineasescritas+1;
				}
				list.add(createCp1252("------------------------------------------\r\n"));lineasescritas=lineasescritas+1;
				list.add(createCp1252("NO:"+nofact+"                      \r\n"));lineasescritas=lineasescritas+1;
				Date fechafact=new Date(fechanumber);
				String fechaf=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(fechafact);lineasescritas=lineasescritas+1;
				list.add(createCp1252("FECHA:"+fechaf+"                      \r\n"));lineasescritas=lineasescritas+1;
				list.add(createCp1252("  # DESCRIPCION                       SUMA\r\n"));lineasescritas=lineasescritas+1;
				
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment
				list.add(createCp1252("------------------------------------------\r\n"));lineasescritas=lineasescritas+1;
				
				if(expprod.length()>0){
					for(int i=0;i<expprod.length();i++){
						try{
						JSONObject linea=expprod.getJSONObject(i);
						String cantidad=linea.getString("cant_prod");
						if(cantidad.length()<3){
							int tam=3-cantidad.length();
							for(int n=0;n<tam;n++){
								cantidad=" "+cantidad;
							}
						}
						
						String totc=DoubleFormat((linea.getDouble("precio_orig")+linea.getDouble("agregados"))*linea.getDouble("cant_prod"));
						//String totc=String.valueOf(total);
						if(totc.length()<7){
							int tam=7-totc.length();
							for(int n=0;n<tam;n++){
								totc=" "+totc;
							}
						}
						
						String desc=linea.getString("nombre_producto");
						if(desc.length()>31)
							desc=desc.substring(0,30);
						else if(desc.length()<31){
							int tam=30-desc.length();
							for(int n=0;n<tam;n++){
								desc=desc+" ";
							}
						}
												
						
						list.add(createCp1252(String.valueOf(cantidad)+" "+String.valueOf(desc)+" "+String.valueOf(totc)+"\r\n"));
						lineasescritas=lineasescritas+1;
						//list.add(createCp1252(" 4  3,00  JARRA  CERVESA   12,00\r\n"));
						//list.add(createCp1252(" 1  1,60  COPA DE CERVESA   1,60\r\n"));
						
						/**/
						if(!(linea.getString("detalle_agregados").equals(JSONObject.NULL))){
							if(!(linea.getString("detalle_agregados").equals(""))){
								String [] agregadosv=linea.getString("detalle_agregados").split("@");
								for(int s=0;s<agregadosv.length;s++){
									String [] detalleagr=agregadosv[s].split("\\|");
									list.add(createCp1252("    "+detalleagr[0]+":"+detalleagr[1]+"\r\n"));
									lineasescritas=lineasescritas+1;
								}
							}
						}
						/**/
						}catch(JSONException ex){
							ex.printStackTrace();
						}
					}
					
				}
				
				list.add(createCp1252("------------------------------------------\r\n"));lineasescritas=lineasescritas+1;
				
						if(subconiva.length()<6){
							int tam=6-subconiva.length();
							for(int n=0;n<tam;n++){
								subconiva=" "+subconiva;
							}
						}
				
						if(subsiniva.length()<6){
							int tam=6-subsiniva.length();
							for(int n=0;n<tam;n++){
								subsiniva=" "+subsiniva;
							}
						}
						
						if(subtotal.length()<6){
							int tam=6-subtotal.length();
							for(int n=0;n<tam;n++){
								subtotal=" "+subtotal;
							}
						}
						
						if(iva.length()<6){
							int tam=6-iva.length();
							for(int n=0;n<tam;n++){
								iva=" "+iva;
							}
						}
						
						if(totalfact.length()<6){
							int tam=6-totalfact.length();
							for(int n=0;n<tam;n++){
								totalfact=" "+totalfact;
							}
						}
						
						if(descuento.length()<6){
							int tam=6-descuento.length();
							for(int n=0;n<tam;n++){
								descuento=" "+descuento;
							}
						}
						
						if(servicio.length()<6){
							int tam=6-servicio.length();
							for(int n=0;n<tam;n++){
								servicio=" "+servicio;
							}
						}

				if(Double.parseDouble(subtotal.replace(",","."))>0){
					list.add(createCp1252("                           SUBTOTAL:"+String.valueOf(subtotal)+"\r\n"));
					lineasescritas=lineasescritas+1;
				}
				/*if(Double.parseDouble(subconiva.replace(",","."))>0){
					list.add(createCp1252("                          SUBCONIVA:"+String.valueOf(subconiva)+"\r\n"));
					lineasescritas=lineasescritas+1;
				}
				if(Double.parseDouble(subsiniva.replace(",","."))>0){
					list.add(createCp1252("                          SUBSINIVA:"+String.valueOf(subsiniva)+"\r\n"));
					lineasescritas=lineasescritas+1;
				}*/
				
				/*imprime impuestos*/
				if(!cadimpuestos.equals("")){
					String[] imps = cadimpuestos.split("@");
					for(int k=0;k<imps.length;k++){
						if(!imps[k].equals("")){
							String [] dataimp=imps[k].split("\\|");
							if(Double.parseDouble(dataimp[3].replace(",","."))>0.00){
								String porcen=DoubleFormat(Double.parseDouble(dataimp[2])*100);
								String nombreimp=dataimp[1]+" "+porcen+"%:";
								String valorimp=DoubleFormat(Double.parseDouble(dataimp[3].replace(",",".")));
								if(valorimp.length()<6){
									int tam=6-valorimp.length();
									for(int n=0;n<tam;n++){
										valorimp=" "+valorimp;
									}
								}
								
								if(nombreimp.length()<36){
									int tam=36-nombreimp.length();
									for(int n=0;n<tam;n++){
										nombreimp=" "+nombreimp;
									}
								}
								
								list.add(createCp1252(String.valueOf(nombreimp)+String.valueOf(valorimp)+"\r\n"));
								lineasescritas=lineasescritas+1;
							}
						}
					}
				}else{
					if(Double.parseDouble(iva.replace(",","."))>0){
						list.add(createCp1252("                                IVA:"+String.valueOf(iva)+"\r\n"));
						lineasescritas=lineasescritas+1;
					}
					if(Double.parseDouble(servicio.replace(",","."))>0){
						list.add(createCp1252("                           SERVICIO:"+String.valueOf(servicio)+"\r\n"));
						lineasescritas=lineasescritas+1;
					}
				}
				/*fin impuestos*/
				
				
				
				
				if(Double.parseDouble(descuento.replace(",","."))>0){
					list.add(createCp1252("                          DESCUENTO:"+String.valueOf(descuento)+"\r\n"));
					lineasescritas=lineasescritas+1;
				}
				
				//list.add(new byte[] { 0x09, 0x1b, 0x69, 0x01, 0x00 });
				list.add(new byte[] { 0x1b, 0x57, 0x01});
				list.add(new byte[] { 0x1b, 0x1d, 0x61,0x02});
				list.add(createCp1252("TOTAL:	"+String.valueOf(totalfact)+"\r\n"));
				lineasescritas=lineasescritas+1;
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });
				list.add(new byte[] { 0x1b, 0x57, 0x00 });
				list.add(createCp1252("------------------------------------------\r\n"));lineasescritas=lineasescritas+1;
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 });				
				list.add(new byte[] { 0x1b, 0x68, 0x01 });				
				list.add(createCp1252("*Orden para: "+ordername+"*\r\n"));
				list.add(createCp1252("**** PRACTIPOS ****\r\n"));
				lineasescritas=lineasescritas+1;
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });	
				list.add(new byte[] { 0x1b, 0x68, 0x00 });
				//list.add(new byte[] { 0x1b, 0x68, 0x00 });
				//aumentar filas si faltan
				if(lineasescritas<lineastotales){
					while(lineasescritas<lineastotales){
						list.add(createCp1252("\r\n"));
						lineasescritas=lineasescritas+1;
					}
				}
				list.add(new byte[] { 0x1b, 0x64, 0x02 }); // Cut
				list.add(new byte[] { 0x07 }); // Kick cash draweR
				
			}else if(tipo.equals("cierre")==true){
				if(subtotalCierre.length()<9){
					int tam=9-subtotalCierre.length();
						for(int n=0;n<tam;n++){
							subtotalCierre=" "+subtotalCierre;
						}
				}
						
				if(ivaCierre.length()<9){
					int tam=9-ivaCierre.length();
						for(int n=0;n<tam;n++){
								ivaCierre=" "+ivaCierre;
						}
				}
				
				if(totalCierre.length()<9){
					int tam=9-totalCierre.length();
						for(int n=0;n<tam;n++){
								totalCierre=" "+totalCierre;
						}
				}
				
				list.add(new byte[] { 0x1b, 0x1d, 0x74, 0x20 }); // Code Page #1252 (Windows Latin-1)
				list.add(new byte[] { 0x1b, 0x44, 0x02, 0x06, 0x0a, 0x10, 0x14, 0x1a, 0x22, 0x24, 0x28, 0x00 }); // Set horizontal tab
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 }); // Alignment (center)
				// list.add("[If loaded.. Logo1 goes here]\r\n".getBytes());
				// list.add(new byte[]{0x1b, 0x1c, 0x70, 0x01, 0x00, '\r', '\n'}); //Stored Logo Printing
				// Notice that we use a unicode representation because that is
				// how Java expresses these bytes as double byte unicode
				// Character expansion
				list.add(new byte[] { 0x1b, 0x68, 0x01 });				
				list.add(createCp1252("CIERRE DE CAJA\r\n"));
				list.add(new byte[] { 0x1b, 0x68, 0x00 }); // Cancel Character Expansion
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("FECHA IMP.:"+fechaImpresion+"\r\n"));
				list.add(createCp1252("FECHA CIERRE:"+fechaCierre+"\r\n"));
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 }); // Alignment
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("FACTURAS\r\n"));
				if(numeroFacturas.length()<9){
								int tam=9-numeroFacturas.length();
									for(int n=0;n<tam;n++){
											numeroFacturas=" "+numeroFacturas;
									}
							}
				
				if(anuladas.length()<9){
					int tam=9-anuladas.length();
					for(int n=0;n<tam;n++){
							anuladas=" "+anuladas;
						}
				}
				
				if(descuentoCierre.length()<9){
					int tam=9-descuentoCierre.length();
						for(int n=0;n<tam;n++){
								descuentoCierre=" "+descuentoCierre;
						}
				}
				
				if(subdes.length()<9){
					int tam=9-subdes.length();
						for(int n=0;n<tam;n++){
								subdes=" "+subdes;
						}
				}
				
				if(servicioCierre.length()<9){
					int tam=9-servicioCierre.length();
						for(int n=0;n<tam;n++){
								servicioCierre=" "+servicioCierre;
						}
				}
				
				list.add(createCp1252("No. Facturas    "+numeroFacturas+"\r\n"));
				list.add(createCp1252("No. Anuladas    "+anuladas+"\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("TOTALES\r\n"));
				list.add(createCp1252("Subtotal        "+subtotalCierre+"\r\n"));
				list.add(createCp1252("Descuentos      "+descuentoCierre+"\r\n"));
				list.add(createCp1252("Sub-desc        "+subdes+"\r\n"));
				 
				/*impuestos*/
				
				if(cierreImpuestos.length()>0){
					try{
						JSONObject linea2=cierreImpuestos.getJSONObject(0);
						//String [] names=JSONObject.getNames(linea);
						Iterator key2 = linea2.keys();
						while (key2.hasNext()) {
							String nombre2 = key2.next().toString();
							String valor2=linea2.getString(nombre2);
							
							if(valor2.length()<9){
								int tam=9-valor2.length();
									for(int n=0;n<tam;n++){
											valor2=" "+valor2;
									}
							}
							
							if(nombre2.length()<15){
								int tam=15-nombre2.length();
									for(int n=0;n<tam;n++){
											nombre2=nombre2+" ";
									}
							}
							list.add(createCp1252(String.valueOf(nombre2)+" "+String.valueOf(valor2)+"\r\n"));
						}
					}catch(JSONException ex){
						ex.printStackTrace();
					}
				}
				else{
					list.add(createCp1252("Iva             "+ivaCierre+"\r\n"));
					list.add(createCp1252("Servicio        "+servicioCierre+"\r\n"));
				}
				
				/**/
				
				
				
				list.add(createCp1252("TOTAL           "+totalCierre+"\r\n"));
				list.add(new byte[] { 0x1b, 0x69, 0x00, 0x00 }); // Cancel Character Expansion
				list.add(createCp1252("--------------------------------\r\n"));
				list.add(createCp1252("FORMAS DE PAGO\r\n"));
				if(expformas.length()>0){
						try{
						JSONObject linea=expformas.getJSONObject(0);
						//String [] names=JSONObject.getNames(linea);
						Iterator key = linea.keys();
						while (key.hasNext()) {
							String nombre = key.next().toString();
							String valor=linea.getString(nombre);
							
							if(valor.length()<9){
								int tam=9-valor.length();
									for(int n=0;n<tam;n++){
											valor=" "+valor;
									}
							}
							
							if(nombre.length()<15){
								int tam=15-nombre.length();
									for(int n=0;n<tam;n++){
											nombre=nombre+" ";
									}
							}
							
							list.add(createCp1252(String.valueOf(nombre)+" "+String.valueOf(valor)+"\r\n"));
						}
						/*for(int m=0;m<names.length();m++)
						{
							String nombre=names[m];
							String valor=linea.getString(names[m]);
							list.add(createCp1252(String.valueOf(nombre)+":"+String.valueOf(valor)+"\r\n"));
						}	*/					
						}catch(JSONException ex){
								ex.printStackTrace();
						}
				}
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });
				list.add(new byte[] { 0x1b, 0x57, 0x00 });
				list.add(createCp1252("------------------------------------------\r\n"));
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 });				
				list.add(new byte[] { 0x1b, 0x68, 0x01 });				
				list.add(createCp1252("**** PRACTIPOS ****\r\n"));
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });	
				list.add(new byte[] { 0x1b, 0x68, 0x00 });
				list.add(new byte[] { 0x1b, 0x68, 0x00 });
				list.add(new byte[] { 0x1b, 0x64, 0x02 }); // Cut
				list.add(new byte[] { 0x07 }); // Kick cash draweR
			}
			
				PrinterFunctions.SendCommand(context, portName, portSettings, list);
				/*try {
					PrinterFunctions.SendCommand(context, portName, portSettings, list);
					callbackContext.success();
				} catch (StarIOPortException e) {
					callbackContext.error(e.getMessage());
				}*/
				
				//list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x00 });		
				//list.add(new byte[] { 0x1b, 0x57, 0x00 });	
				/*list.add(createCp1252("------------------------------------------\r\n"));
				list.add(new byte[] { 0x1b, 0x1d, 0x61, 0x01 });				
				list.add(new byte[] { 0x1b, 0x68, 0x01 });				
				list.add(createCp1252("**** NUBEPOS ****\r\n"));
				list.add(new byte[] { 0x1b, 0x68, 0x00 });
				list.add(new byte[] { 0x1b, 0x68, 0x00 });
				list.add(new byte[] { 0x1b, 0x64, 0x02 }); // Cut
				list.add(new byte[] { 0x07 }); // Kick cash draweR*/
		}		
    }
	
	 /**
     * This method search all printers
     * @param callbackContext the callback context of the action
     * @param message the string containing all the content to print
     * @param portSettings the port settings for the connection to the printer ("mini" if you are printing on star portable printers)
     */
    private void searchAll(CallbackContext callbackContext, String portNameSearch) {
        ArrayList<String> portNames =new ArrayList<String>();
		//String portNames="";
        String portSettings = "";
        Context context = this.cordova.getActivity().getApplicationContext();
		//int x=0;
        try {
			portNames = PrinterFunctions.getPrinters(portNameSearch,context);
			//portNames = PrinterFunctions.getFirstPrinter(portNameSearch);
			if(portNames.size()>0){
				for(int x=0;x<portNames.size();x++) {
					String needle="BT:";
					if(portNames.get(x).toLowerCase().contains(needle.toLowerCase())){
						callbackContext.success(portNames.get(x));
					}else{
						StarPrinterStatus status = PrinterFunctions.GetStatus(context,portNames.get(x), portSettings, true);
					   //StarPrinterStatus status = PrinterFunctions.GetStatus(context, portNames, portSettings, true);
						if (status == null) {
							callbackContext.error("Cannot get the printer status.");
						} else if (status.offline) {
							callbackContext.error("The printer is offline.");
						} else {
							callbackContext.success(portNames.get(x));
							//callbackContext.success(portNames);
						} 
					}
				}	
			}else{
				callbackContext.error("No se han detectado impresoras.");
			}
        } catch (StarIOPortException e) {
            callbackContext.error(e.getMessage());
        }
	}
	
	private static byte[] createCp1252(String inputText) {
		byte[] byteBuffer = null;
		
		try {
			byteBuffer = inputText.getBytes("Windows-1252");
		} catch (UnsupportedEncodingException e) {
			byteBuffer = inputText.getBytes();
		}
		
		return byteBuffer;
	}
	
	private static byte[] createCpUTF8(String inputText) {
		byte[] byteBuffer = null;
		
		try {
			byteBuffer = inputText.getBytes("UTF-8");
		} catch (UnsupportedEncodingException e) {
			byteBuffer = inputText.getBytes();
		}
		
		return byteBuffer;
	}
	
	public static String DoubleFormat(double parDouble)
	{
		DecimalFormat formatter = new DecimalFormat("###,##0.00"); 
		String myNumero = formatter.format(parDouble);
		return myNumero;
	}
	
	private static byte[] createRasterCommand(String printText, int textSize, int bold, RasterCommand rasterType) {
		byte[] command;

		Paint paint = new Paint();
		paint.setStyle(Paint.Style.FILL);
		paint.setColor(Color.BLACK);
		paint.setAntiAlias(true);

		Typeface typeface;

		try {
			typeface = Typeface.create(Typeface.SERIF, bold);
		} catch (Exception e) {
			typeface = Typeface.create(Typeface.DEFAULT, bold);
		}

		paint.setTypeface(typeface);
		paint.setTextSize(textSize * 2);
		paint.setLinearText(true);

		TextPaint textpaint = new TextPaint(paint);
		textpaint.setLinearText(true);
		android.text.StaticLayout staticLayout = new StaticLayout(printText, textpaint, printableArea, Layout.Alignment.ALIGN_NORMAL, 1, 0, false);
		int height = staticLayout.getHeight();

		Bitmap bitmap = Bitmap.createBitmap(staticLayout.getWidth(), height, Bitmap.Config.RGB_565);
		Canvas c = new Canvas(bitmap);
		c.drawColor(Color.WHITE);
		c.translate(0, 0);
		staticLayout.draw(c);

		StarBitmap starbitmap = new StarBitmap(bitmap, false, printableArea);

		if (rasterType == RasterCommand.Standard) {
			command = starbitmap.getImageRasterDataForPrinting_Standard(true);
		} else {
			command = starbitmap.getImageRasterDataForPrinting_graphic(true);
		}

		return command;
	}
}

