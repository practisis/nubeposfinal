var campos=new Array();
campos["PRODUCTOS"]=['id_local','id','formulado','codigo','precio','categoriaid','cargaiva','productofinal','materiaprima','timespan','ppq','color','servicio','estado','sincronizar'];

function updateOnlineStatus(condition) {
					var status = document.getElementById("status");
					//var condition = navigator.onLine ? "ONLINE" : "OFFLINE";
					var state = document.getElementById("state");
					var log = document.getElementById("log");
					$('#conexion').val(condition);
					
					var conexionInternet = $('#conexion').val();
					console.log(conexionInternet)
					if(conexionInternet == 'ONLINE' ){
						$('#cloudIndex').css('display','block');
						$('#cloudIndexOff').css('display','none');
					}else if(conexionInternet == 'OFFLINE' ){
						$('#cloudIndex').css('display','none');
						$('#cloudIndexOff').css('display','block');
					}
	}

function envia(donde){
			//if(loopSicnronizador) clearInterval(loopSicnronizador);
            //clearInterval(intervalProcesoRepetir);
					var lugar='';
					$('#cargandoTabs').css('display','block');
					if(donde=='dashboard')
					lugar="views/dashboard/dashboard.html";
					if(donde=='puntodeventa')
					lugar="views/nubepos/nubepos.html";
					if(donde=='listaproductos')
					lugar="views/productos/listaproductos.html";
					if(donde=='nuevoproducto')
					lugar="views/productos/nuevoproducto.html";
                    if(donde=='inventario')
					lugar="views/productos/inventarioproductos.html";
					if(donde=='listadeclientes'){
						lugar="views/clientes/listaclientes.html"; 
					}if(donde=='nuevocliente')
					lugar="views/clientes/nuevocliente.html";
					if(donde=='historial')
					lugar="views/facturacion/historial.html";
					if(donde=='cloud')
					lugar="views/cloud/indexCloud.html";
                    if(donde=='imprimeotro')
					lugar="indexprint.html";
					//alert(lugar);
					if(donde=='empresa')
					lugar="views/cloud/indexEmpresa.html";
					if(donde=='printconfig')
					lugar="views/configuracion/impresoras.html";
					if(donde=='log')
					lugar="views/configuracion/log.html";
					if(donde=='config')
					lugar="views/configuracion/configuracion.html";
					if(!lugar) lugar="404.html";
					$('#cargandoTabs').css('display','none');
					$('#correoMal').fadeOut('slow');
					$.get(lugar,function(data){
						$('#main').html(data);
					});
					/*$('#main').load(lugar,function(){
						$("#simple-menu").click();
					});						
						//DOMOnTap();
						//loaded();
					setTimeout(function(){
						$('#cargandoTabs').css('display','none');
						$('#correoMal').fadeOut('slow');
						$('#main').load(lugar,function(){
						$("#simple-menu").click();						
						//DOMOnTap();
						//loaded();
						});
					}, 1000);*/
					
					//collapsa el menu cuando está metido
					$("#bs-example-navbar-collapse-1").attr('class', 'navbar-collapse collapse');
					
					
				}
		

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener("pause", function(){ alert("pausa");}, false);
		document.addEventListener("backbutton", function(){alert("back");}, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
       // app.receivedEvent('deviceready');
	  // onDeviceReady();
	},
	// Update DOM on a Received Event
	/*receivedEvent: function(id) {
			var parentElement = document.getElementById(id);
			var listeningElement = parentElement.querySelector('.listening');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');

			console.log('Received Event: ' + id);
			
		}*/
};




    onDeviceReady();
    function onDeviceReady(){
		
		//alert("device Ready>>" + device.uuid);
		//$('#deviceid').html(device.uuid);
		//setInterval(function(){updateOnlineStatus()},60000);
		window.addEventListener('native.keyboardshow', keyboardShowHandler);
		document.addEventListener("pause", function(){localStorage.setItem("claveuser","");}, false);
		//document.addEventListener("backbutton", function(){localStorage.setItem("claveuser","");}, false);
		
		function keyboardShowHandler(e){
			//alert("show");
			var inp=$(":focus");
			var padding = 15;
            var targetPosition = parseInt($(inp).offset().top + padding);
            var keyboardHeight = parseInt($(window).height())-parseInt(e.keyboardHeight);//get keyboard height   

                    //if the input is hidden by the keyboard,scroll to the input 
			//alert(targetPosition+'/'+keyboardHeight);
            if (targetPosition >= keyboardHeight) {
                //padding *=5;
				if(inp.attr('id')=='search-renderitem')
                $('#mybodycontent').css("top",-(targetPosition-keyboardHeight+padding+20)+"px");
				else
                $('#mybodycontent').css("top",-(targetPosition-keyboardHeight+padding)+"px");
            }
		}

		// This event fires when the keyboard will show
		window.addEventListener('native.keyboardhide', keyboardHideHandler);

		function keyboardHideHandler(e){
			//alert("hide");
			$('#mybodycontent').css("top","0px");
		}
		
		window.StarIOAdapter = {};
		var handle_error_callback = function(error_message) {
			//alert(error_message);
			//showalert(error_message);
			console.log(error_message);
		};
		
	
		/**
		 * Checks the status of the bluetooth printer and returns the string "OK" if the printer is online
		 */
		window.StarIOAdapter.check = function(port_search, success_callback, error_callback) {
			if(error_callback == null) {
				error_callback = handle_error_callback;
			}
			return cordova.exec(success_callback, error_callback, "StarIOAdapter", "check", [port_search]);
		};

		/**
		* Launches a raw print on the printer, it returns a string with "OK" if the sending was fine
		*/
		window.StarIOAdapter.rawprint = function(message, port_search,success_callback, error_callback) {
			if(error_callback == null) {
				error_callback = handle_error_callback;
			}

			return cordova.exec(success_callback, error_callback, "StarIOAdapter", "rawprint", [message, port_search]);
		};
		
		/*Search the availables printers*/
		window.StarIOAdapter.searchall=function(port_search, success_callback, error_callback){
			//alert("todas buscar");
			if(error_callback == null) {
				error_callback = handle_error_callback;
			}
			return cordova.exec(success_callback, error_callback, "StarIOAdapter", "searchall", [port_search]);
		};
		
        /*var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(iniciaDB, errorCB, successCB);
        console.log(db);*/

		
        /* var element = document.getElementById('deviceProperties');
        element.innerHTML = 'Device Model: '    + device.model    + '<br />' +
                        'Device Cordova: '  + device.cordova  + '<br />' +
                        'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: '     + device.uuid     + '<br />' +
                        'Device Version: '  + device.version  + '<br />';*/
    }

    // Populate the database
    //
    function iniciaDB(tx){
        //console.log("Ana");
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        //tx.executeSql('DROP TABLE IF EXISTS PRODUCTOS');
        tx.executeSql('CREATE TABLE IF NOT EXISTS PRODUCTOS (id_local integer primary key AUTOINCREMENT,id integer, formulado text, codigo text, precio real, categoriaid text,cargaiva integer,productofinal integer,materiaprima integer,timespan text UNIQUE,ppq real default 0,color text,servicio integer default 0,estado integer default 1, sincronizar boolean default "true")');
		
		VerificarCampos('PRODUCTOS');
		
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS CONFIG (id integer primary key AUTOINCREMENT, nombre text, razon text , ruc integer, telefono integer , email text , direccion text, printer text,serie text default "001",establecimiento text default "001",sincronizar boolean default "false",encabezado integer default 3,largo integer default 18, nombreterminal text default "Tablet 1")');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS LOGACTIONS (id integer primary key AUTOINCREMENT, time numeric, descripcion text, datos text)');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS FACTURAS_FORMULADOS (id integer primary key AUTOINCREMENT, timespan_factura text, timespan_formulado text , cantidad real, precio_unitario real)');
		
        tx.executeSql('INSERT INTO PRODUCTOS(id_local,id,codigo,precio,categoriaid,cargaiva,productofinal,materiaprima,timespan,formulado,estado) VALUES(-1,-1,"-1",0,-1,0,0,0,"-1","Producto NubePOS",0)');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS MENU_CATEGORIAS (id integer primary key AUTOINCREMENT, orden integer default 1,nombre text default "", timespan text UNIQUE, activo boolean default "true")');
		
		/*var mitimecat=getTimeSpan();
		tx.executeSql('INSERT INTO MENU_CATEGORIAS (orden,nombre,timespan) values (?,?,?)',[1,'Productos',mitimecat]);*/
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS MENU (id integer primary key AUTOINCREMENT, fila integer default 0, columna integer default 0,idcatmenu text,idproducto text, timespan text UNIQUE, activo boolean default true)');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS PERMISOS (id integer primary key AUTOINCREMENT, clave text default "" UNIQUE, historial boolean default false,configuracion boolean default false,anular boolean default false, impcierre boolean default false,productos boolean default false,activo boolean default false)');
		
		/*var mitimemenu=getTimeSpan();
		tx.executeSql('INSERT INTO MENU (fila,columna,idcatmenu,idproducto,timespan) values (?,?,?,?,?)',[1,2,mitimecat,'14522044131343980',mitimemenu]);*/
		
        //tx.executeSql('CREATE TABLE IF NOT EXISTS CARDEX (id integer primary key AUTOINCREMENT,id_formulado integer, cantidad real, descripcion text, precio_unidad real, fecha integer,ppq_real real,iva numeric,timespan integer,idfactura text)');
        /*tx.executeSql('SELECT COUNT(id_local) as cuantos FROM PRODUCTOS',[],function(tx,res){
            var existen=res.rows.item(0).cuantos;
            if(existen==0)
                db.transaction(Ingresaproductos,errorCB,successCB);
        });*/
        
        
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        //tx.executeSql('DROP TABLE IF EXISTS PRODUCTOS');
        //tx.executeSql('CREATE TABLE IF NOT EXISTS empresa (id integer primary key AUTOINCREMENT, nombre integer )');
         tx.executeSql('CREATE TABLE IF NOT EXISTS empresa (id integer primary key AUTOINCREMENT, nombre integer, nombreempresa text, id_barra text, barra_arriba text )');
       
        
        function insertaTablas(tabla){
            console.log(tabla);
            var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
            var inicia =0;
            tx.executeSql('INSERT INTO logActualizar (tabla , incicial ,final) VALUES (?,? ,? );',[tabla , inicia , inicia],function(tx,res){
                console.log("logActualizar :"+res.insertId);
            });    
            
        }
        
		//tx.executeSql('DROP TABLE IF EXISTS CATEGORIAS');
        tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORIAS (id integer primary key AUTOINCREMENT, categoria text, activo integer, existe integer , timespan text UNIQUE, sincronizar boolean default "true"  )');
        tx.executeSql('SELECT COUNT(id) as cuantos FROM CATEGORIAS',[],function(tx,res){
            var existen=res.rows.item(0).cuantos;
            if(existen==0)
                db.transaction(IngresaCategorias,errorCB,successCB);
        });
        //tx.executeSql('DROP TABLE IF EXISTS CLIENTES');
        tx.executeSql('CREATE TABLE IF NOT EXISTS CLIENTES (id integer primary key AUTOINCREMENT,nombre text, cedula text UNIQUE, email text, direccion text, telefono text,existe integer,timespan TEXT, sincronizar boolean default "true")');
        tx.executeSql('SELECT COUNT(id) as cuantos FROM CLIENTES',[],function(tx,res){
            var existen=res.rows.item(0).cuantos;
            if(existen==0)
                db.transaction(IngresaClientes,errorCB,successCB);
        });
        //tx.executeSql('DROP TABLE IF EXISTS FACTURAS');
        tx.executeSql('CREATE TABLE IF NOT EXISTS FACTURAS (id integer primary key AUTOINCREMENT,timespan text ,clientName,RUC,address,tele,fetchJson,paymentsUsed,cash,cards,cheques,vauleCxC,paymentConsumoInterno,tablita,aux ,acc,echo real default 0,fecha,anulada integer default 0,sincronizar boolean default "false",total real,subconiva real,subsiniva real,iva real,servicio real,descuento real,nofact text);');
        tx.executeSql('CREATE TABLE IF NOT EXISTS CAJA (id integer primary key AUTOINCREMENT,hora_ingreso text,hora_salida text,activo integer,sobrante_faltante real,total real,establecimiento text,autorizacion text);');
        tx.executeSql('CREATE TABLE IF NOT EXISTS CAJA_APERTURA_CIERRE (id integer primary key AUTOINCREMENT,id_caja integer,valor_apertura real,movimiento integer);',[],function(tx,result){
            //console.log('Ana');
            //$('#myModal').modal('hide');
        });
		tx.executeSql('CREATE TABLE IF NOT EXISTS PRESUPUESTO (id integer primary key AUTOINCREMENT,timespan text,valor real,fecha integer UNIQUE,transacciones integer);');
    }

	function VerificarCampos(tabla){
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function (tx){
			tx.executeSql("SELECT sql from sqlite_master WHERE type = 'table' and name like ?",[tabla],function(tx,res){
				if(res.rows.length>0){
					var sqlvec=res.rows.item(0).sql.replace(")","").split('(');
					var camposvec=sqlvec[1].split(',');
					for(var n=0;n<camposvec.length;n++){
						var cols=$.trim(camposvec[n]).split(" ");
						var nombrecol=cols[0];
						/*var campostabla=campos
						for(var m in campos[tabla]){
							if(campos[tabla][m])
						}*/
					}
					
				}
				
			});
		},errorCB,successCB);
	}

    // Transaction error callback
    //
    function errorCB(err){
        console.log("Error processing SQL: "+err.message);
    }

    // Transaction success callback
    //
    function successCB() {
        console.log("success!");
    }
  
    /*Funciones Ana:*/
    function Ingresaproductos(){
         var json = $('#jsonProductos').html();
            var mijson = eval(''+json+'');
            for(var j in mijson){
                for(var k in mijson[j]){
                    for(i = 0; i < mijson[j][k].length; i++){
                            var item = mijson[j][k][i];
                            InsertaProducto(item);
                    }
                }
            }
    }
    
    function InsertaProducto(itempr){
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        var cargaiva=0;
        var imp=itempr.formulado_tax_id.split('|');
        if(imp.indexOf("1")>=0)
            cargaiva=1;
            db.transaction(
            function (tx){
                    tx.executeSql('INSERT INTO PRODUCTOS (id,formulado,codigo,precio,categoriaid,cargaiva,productofinal,materiaprima) VALUES (?,?,?,?,?,?,?,?);',[itempr.formulado_id,itempr.formulado_nombre,itempr.formulado_codigo,itempr.formulado_precio,itempr.formulado_tipo,cargaiva,1,itempr.formulado_matprima],
                    function(tx,res){
                        //console.log("vamos:"+res.insertId)
                    });                
            },errorCB,successCB);
    }
    
    function IngresaCategorias(){
        /*
        var json = $('#jsonCategorias').html();
            var mijson = JSON.parse(json);
            console.log(mijson);
            for(var j in mijson){
                for(var k in mijson[j]){
                        var item=mijson[j][k];
                        metedatoscat(item);
                }
            }
        */
    }
    
    function metedatoscat(itemc){
        //console.log(itemc);
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(
        function (tx){
                    tx.executeSql('INSERT INTO CATEGORIAS(id,categoria,activo,existe)VALUES(?,?,?,?);',[itemc.categoria_id,itemc.categoria_nombre,1,1],
                    function(tx,res){
                        console.log(res);
                        console.log("vamos:"+res.insertId+"categorias");
                    });                
        },errorCB,successCB);
    }
    
    function IngresaClientes(){
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(
        function (tx){
                    tx.executeSql('INSERT INTO CLIENTES(id,nombre,cedula,existe)VALUES(?,?,?,?);',["1","Consumidor Final","9999999999999",1],
                    function(tx,res){
                        //console.log(res);
                        console.log("vamos:"+res.insertId+"clientes");
                    });                
        },errorCB,successCB);
		
        /*
        var json = $('#jsonmisclientes').html();
            var mijson = JSON.parse(json);
            //console.log(mijson);
            for(var j in mijson){
                for(var k in mijson[j]){
                        var item=mijson[j][k];
                        metedatoscliente(item);
                }
            }
        */
    }
	
	
	   function Ingresaconfig(){
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(
        function (tx){
                    tx.executeSql('INSERT INTO CONFIG(nombre)VALUES(?);',["Empresa TEst"],
                    function(tx,res){
                        //console.log(res);
                        console.log("vamos:"+res.insertId+"config");
                    });                
        },errorCB,successCB);
		
   
    }
    
    function metedatoscliente(itemc){
        //console.log(itemc);
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(
        function (tx){
                    tx.executeSql('INSERT INTO CLIENTES(id,nombre,cedula,telefono,direccion,email,existe)VALUES(?,?,?,?,?,?,?);',[itemc.id,itemc.nombre,itemc.cedula,itemc.telefono,itemc.direccion,itemc.email,1],
                    function(tx,res){
                        //console.log(res);
                        console.log("vamos:"+res.insertId+"clientes");
                    });                
        },errorCB,successCB);
    }
    
    function VerDatosProducto(id){
    var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
    db.transaction(function(tx){
    tx.executeSql('SELECT p.*,c.categoria as categ FROM PRODUCTOS p, CATEGORIAS c WHERE p.timespan='+id+' and p.categoriaid=c.timespan;',[],function(tx,results){
        var row=results.rows.item(0);
        $('#idproducto').val(row.id_local);
        $('#titulonuevopr').html("Editar Producto");
        $('#nombreproducto').val(row.formulado);
        $('#codigoproducto').val(row.codigo);
        $('#precioproducto').val(row.precio.toFixed(2));
        $('#search-renderitem').val(row.categ);
        $('#idcategoria').val(row.categoriaid);
        $('#mprima').prop('checked',false);
        $('#pfinal').prop('checked',false);
        $('#coniva').prop('checked',false);
        $('#conservicio').prop('checked',false);
        if(row.materiaprima==1)
        $('#mprima').prop('checked',true);
        if(row.productofinal==1)
        $('#pfinal').prop('checked',true);
        if(row.cargaiva==1)
        $('#coniva').prop('checked',true);
		if(row.servicio==1)
        $('#conservicio').prop('checked',true);
    },errorCB,successCB);
    });
    }
    
    function VerDatosCliente(id){
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(function(tx){
        tx.executeSql('SELECT * FROM CLIENTES WHERE id='+id+';',[],function(tx,results){
            var row=results.rows.item(0);
            $('#idcliente').val(row.id);
            $('#titulocliente').html("Editar Cliente");
            $('#nombrecliente').val(row.nombre);
            $('#cedulacliente').val(row.cedula);
            $('#telefono').val(row.telefono);
            $('#direccion').val(row.direccion);
            $('#email').val(row.email);
        },errorCB,successCB);
        });
    }
    
    function VerDatosFactura(id){
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        db.transaction(function(tx){
        tx.executeSql('SELECT * FROM FACTURAS WHERE id='+id+';',[],function(tx,results){
            var inhtml='';
            for (var i=0; i < results.rows.length; i++){
                var row = results.rows.item(i);
                //console.log(row);
                $('#idfactura').val(row.id);
                $('#cliente').val(row.clientName);
				
				//si no tiene permisos
				if(localStorage.getItem("permisos")){
					tx.executeSql("SELECT id from permisos where clave like ? and anular=? and activo=?",[localStorage.getItem("claveuser"),"true","true"],function(tx,results2){
						if(results2.rows.length>0){
							if(results2.rows.item(0).id!=null){
								$('#btnanularf').fadeIn();
							}else{
								$('#btnanularf').fadeOut();
							}
						}else{
							$('#btnanularf').fadeOut();
						}
					});
				}
				//permisos
				
				if(row.anulada=='1'||row.anulada==1){
					$('#btnanularf,#reimprimir').css('display','none');
				}
				
                var timefecha=new Date(row.fecha);
                var mes=timefecha.getMonth()+1;
				var dia=timefecha.getDate();
                if(mes.toString().length<2)
                    mes="0"+mes.toString();
				 if(dia.toString().length<2)
                    dia="0"+dia.toString();
				
                var fechaformat=dia+"-"+mes+"-"+timefecha.getFullYear()+" "+timefecha.getHours()+":"+timefecha.getMinutes()+":"+timefecha.getSeconds();
                //console.log(row);
                $('#fecha').val(fechaformat);
				
                var datosfact=JSON.parse(row.fetchJson);
                var totalf=parseFloat(datosfact.Pagar[0].factura.total).toFixed(2);
				var descAplicado=parseFloat(datosfact.Pagar[0].factura.descuento).toFixed(2);
				console.log('Descuento : '+descAplicado);
				
				var facturanumber=datosfact.Pagar[0].factura.numerofact;
				$('#numerofactura').html('Factura N° '+facturanumber);
				
                $('#total').html(totalf);
                $('#invoiceTotal').html(totalf);
                var intabla='';
                var variosprods=(datosfact.Pagar[0].producto);
				var itemsfact=0;
                for(var n=0;n<variosprods.length;n++){
                    intabla+="<tr><td style='text-align:left;'>"+variosprods[n].nombre_producto+"</td><td style='text-align:right;'>"+parseFloat(variosprods[n].cant_prod)+"</td><td style='text-align:right;'>"+parseFloat(variosprods[n].precio_prod).toFixed(2)+"</td><td style='text-align:right;'>"+parseFloat(variosprods[n].precio_total).toFixed(2)+"</td></tr>";
					itemsfact+=parseInt(parseInt(variosprods[n].cant_prod));
                }
				$('#itemsfacturados').html("<b>Items Facturados:</b> "+itemsfact);
                $('#cuerpodetalle').html(intabla);
				var formaDePago = row.paymentsUsed;
				var totalpagof=0;
				console.log('Forma de pago es :'+formaDePago);
				if(formaDePago == '1'){
					$('#detaFormPago').html('Efectivo');
					$('#detaFormPagoValor').html(parseFloat(row.cash).toFixed(2));
					totalpagof+=parseFloat(row.cash);
					$('#detaFormPago').parent().fadeIn();
				}
				if(formaDePago == '2'){
					var datocard=row.cards.split('|');
					$('#detaFormPago').html('Tarjeta');
					$('#detaFormPagoValor').html(parseFloat(datocard[2].substring(0,datocard[2].length - 1)).toFixed(2));
					totalpagof+=parseFloat(parseFloat(datocard[2].substring(0,datocard[2].length - 1)));
					$('#detaFormPago').parent().fadeIn();
				}
				if(formaDePago == '3'){
				var datocheque=row.cheques.split('|');
				//alert(datocheque[2].substring(0,datocheque[2].length - 1));
					$('#detaFormPago').html('Cheques');
					$('#detaFormPagoValor').html(parseFloat(datocheque[2].substring(0,datocheque[2].length - 1)).toFixed(2));
					totalpagof+=parseFloat(datocheque[2].substring(0,datocheque[2].length - 1));
					$('#detaFormPago').parent().fadeIn();
				}
				
				if(formaDePago == '4'){
				var datocxc=row.vauleCxC;
				//alert(datocheque[2].substring(0,datocheque[2].length - 1));
					$('#detaFormPago').html('CxC');
					$('#detaFormPagoValor').html(parseFloat(datocxc).toFixed(2));
					totalpagof+=parseFloat(datocxc);
					$('#detaFormPago').parent().fadeIn();
				}
				
				if(formaDePago != '1' && formaDePago != '2' && formaDePago != '3' && formaDePago != '4'){
					var fpago=row.paymentsUsed.split(',');
					console.log(fpago);
					var c=0;
					for(var t=0;t<fpago.length;t++){
						console.log(t);
						if(fpago[t]==1){
							$('#detaFormPago').html('Efectivo');
							$('#detaFormPagoValor').html(parseFloat(row.cash).toFixed(2));
							$('#detaFormPago').parent().fadeIn();
						}
						if(fpago[t]==2){
							var datocard=row.cards.split('|');
							$('#detaFormPago1').html('Tarjeta');
							//console.log(datocard);
							$('#detaFormPagoValor1').html(parseFloat(datocard[2].substring(0,datocard[2].length - 1)).toFixed(2));
							$('#detaFormPago1').parent().fadeIn();
						}
						
						if(fpago[t]==3){
							var datocheque=row.cheques.split('|');
							$('#detaFormPago2').html('Cheques');
							//console.log(datocard);
							$('#detaFormPagoValor2').html(parseFloat(datocheque[2].substring(0,datocheque[2].length - 1)).toFixed(2));
							$('#detaFormPago2').parent().fadeIn();
						}
						
						if(fpago[t]==4){
							var datocheque=row.vauleCxC;
							$('#detaFormPago3').html('CxC');
							//console.log(datocard);
							$('#detaFormPagoValor3').html(parseFloat(datocheque).toFixed(2));
							$('#detaFormPago3').parent().fadeIn();
						}
					}
                }
				
				var tot=parseFloat($('#total').html());
				if((tot-totalpagof)<0){
					$('#tabladetformaspago').append('<tr><td><b>Vuelto</b></td><td style="text-align:right;">'+(-1*(tot-totalpagof)).toFixed(2)+'</td></tr>');
				}
				
				if((descAplicado)>0){
					$('#tabladetformaspago').append('<tr><td><b>Descuento</b></td><td style="text-align:right;">'+descAplicado+'</td></tr>');
				}
				
				
                if(row.anulada==1){
                    $('#factanulada').fadeIn();
                }
            }
        },errorCB,successCB);
        });
    }
    
    function CambiarFormaPagoFactura(){
        var inputs=$('.paymentMethods');
        var cadenapago='';
        var cont=0;
        var efectivo=0;
        var tarjetas=0;
        var cheques=0;
        var cc=0;
        var retencion=0;
        var cortesia=0;
        var otros=0;
        inputs.each(function(){
            if($(this).val()>0){
                var idforma=$(this).attr('idpaymentmethod');
                if(cont>0)
                    cadenapago+=',';
                cadenapago+=idforma;
                /*cantidades de formas de pago*/
                if(idforma==1)
                    efectivo=$(this).val();
                if(idforma==2)
                    tarjetas=$(this).val();
                if(idforma==3)
                    cheques=$(this).val();
                if(idforma==4)
                    cc=$(this).val();
                if(idforma==5)
                    retencion=$(this).val();
                if(idforma==6)
                    cortesia=$(this).val();
                if(idforma==7)
                    otros=$(this).val();
                cont++;
            }    
        });
        var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
        tarjetas='0|0|'+tarjetas+'@';
        db.transaction(function(tx){
            var miid=$('#idfactura').val();
            console.log(tarjetas);
            tx.executeSql("UPDATE FACTURAS SET paymentsUsed=?,cash=?,cards=?,cheques=?,vauleCxC=? WHERE id=?;",[cadenapago,efectivo,tarjetas,cheques,cc,miid],function(tx,results){
                console.log(results);
            },errorCB,successCB);
        });
    }
        

function showalert(msg){
    $('#alert').html(msg);
    $('html, body').animate( { scrollTop : 0 },500,function(){
        $('#alert').slideDown('slow',function(){
            setTimeout(function(){hidealert()},1500);
        });
    });
}

function hidealert(){
    $('#alert').html('');
    $('#alert').slideUp('fast');
}

function showalertred(msg){
    $('#alertred').html(msg);
    $('html, body').animate( { scrollTop : 0 },500,function(){
        $('#alertred').slideDown('slow',function(){
            setTimeout(function(){hidealertred()},1500);
        });
    });
}

function hidealertred(){
    $('#alertred').html('');
    $('#alertred').slideUp('fast');
}


function getTimeSpan(){
		var rn=Math.floor((Math.random() * 10000) + 1);
		var d = new Date();
		var n = d.getTime();
		return n+''+rn;
}

function isalphanumeric(e){
	/*console.log(e.which);
	//alert(e.key);
	if(e.which==8||(e.which>=96&&e.which<=105)||(e.which>=65&&e.which<=90)||e.which==20||e.which==110)
	{
		console.log("correcto");
		return;
	} 
	else 
	{ 
		e.preventDefault();
	} */
}

function VerificarClave(){
	var ing=$('#miclave').val();
	var donde=$('#accesodonde').val();
	if(ing!=''){
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx1){
		tx1.executeSql("SELECT * from permisos where clave like ? and activo=?",[ing,'true'],
			function(tx1,results1){
				if(results1.rows.length>0){
					localStorage.setItem("claveuser",ing);
					var item=results1.rows.item(0);
					if(item.historial&&donde=='historial'){
						$('#modalpermiso').modal("hide");
						$('#miclave').val("");
						envia('historial');
					}else if(item.configuracion&&donde=='configuracion'){
						$('#modalpermiso').modal("hide");
						$('#miclave').val("");
						envia('config');
					}else if(item.productos&&donde=='productos'){
						$('#modalpermiso').modal("hide");
						$('#miclave').val("");
						envia('listaproductos');
					}
				}else{
					$('#modalpermiso').modal("hide");
					$('#miclave').val("");
					showalert("No tiene suficientes privilegios para acceder o su clave es incorrecta.");
					localStorage.setItem("claveuser","");
				}
			});}
		,errorCB,successCB);
	}
}
function VerificarPermiso(donde){
		if(localStorage.getItem("permisos")==true){
			if(localStorage.getItem("claveuser")==""||localStorage.getItem("claveuser")==null){
				if(donde!=''){
					$('#modalpermiso').modal("show");
					$('#accesodonde').val(donde);
				}
			}else{
				var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				var miclave=localStorage.getItem("claveuser");
				db.transaction(function(tx1){
				tx1.executeSql("SELECT * from permisos where clave like ? and activo=?",[miclave,'true'],
					function(tx1,results1){
						if(results1.rows.length>0){
							var it=results1.rows.item(0);
							if(donde=='historial'&&it.historial){
								envia('historial');
							}else if(donde=='configuracion'&&it.configuracion){
								envia('config');
							}else if(donde=='productos'&&it.productos){
								envia('listaproductos');
							}
						}else{
							showalert("No tiene suficientes privilegios para acceder o su clave es incorrecta.");
							localStorage.setItem("claveuser","");
						}
					}
				);
				});
			}
		}else{
			if(donde=='historial'){
				envia('historial');
			}else if(donde=='configuracion'){
				envia('config');
			}else if(donde=='productos'){
				envia('listaproductos');
			}
		}
}