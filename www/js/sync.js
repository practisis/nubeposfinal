//inicio nuevo
var procesocount=0;
var yaesta=false;
var apiURL='https://practisis.net/connectnubepos/api2.php';
function SyncStart(){
	var idbarra = localStorage.getItem('idbarra');
	var categoriasya = localStorage.getItem('categoriasya');
	var productosya = localStorage.getItem('productosya');
	var clientesya = localStorage.getItem('clientesya');
	var presupuestoya = localStorage.getItem('presupuestoya');
	var menucategoriasya = localStorage.getItem('menucategoriasya');
	var menuya = localStorage.getItem('menuya');
	var permisosya = localStorage.getItem('permisosya');
	//console.log(idbarra+'*'+categoriasya+'*'+productosya+'*'+clientesya);
	if((clientesya||productosya||categoriasya||presupuestoya||menucategoriasya||menuya||idbarra)&&permisosya==false){
		envia('cloud');
		$('.navbar').slideDown();
	}
	if(permisosya){
		$('#fadeRow,#demoGratis').css("display","none");
		yaesta=true;
		$('.navbar').slideDown();
		envia('dashboard');
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx){
			tx.executeSql('SELECT count(*) as cp FROM PRODUCTOS WHERE id_local !=-1',[],function(tx,results){
				if(results.rows.item(0).cp==0||results.rows.item(0).cp==null){
					LaunchBoarding();
				}
			});
			
			tx.executeSql('SELECT nombre,direccion,telefono from config WHERE id=1',[],function(tx,results){
				var dataemp=results.rows.item(0);
				$('#JSONempresaLocal').html('"empresa":{'+'"nombre":"'+dataemp.nombre+'","direccion":"'+dataemp.direccion+"-"+dataemp.telefono+'"},');
			});
		});
		setTimeout(function(){SincronizadorNormal();},60000);
		//setInterval(function(){SincronizadorNormal();},3000);
	}else if(menuya){
		ExtraeDatosApi(7);
	}else if(menucategoriasya){
		ExtraeDatosApi(6);
	}else if(presupuestoya){
		ExtraeDatosApi(5);
	}else if(clientesya){
		ExtraeDatosApi(4);
	}else if(productosya){
		ExtraeDatosApi(3);
	}else if(categoriasya){
		ExtraeDatosApi(2);
	}else if(idbarra){
		DatosIniciales(1);
	}else{
		ExtraeDatosApi(0);
	}
}

function ExtraeDatosApi(donde){
	console.log("saca datos del api"+donde);
	if(donde==0){
		envia('cloud');
	}else if(donde==1){
		console.log("Datos API 1: Categorias");
		//$(".navbar").slideUp();
		$("#demoGratis,#fadeRow,#finalizado").css("display","none");
		$("#contentStepSincro,#cuentaactiva,#mensajeperso").fadeIn();
		$("#txtSincro").html("Sincronizando Categorías...");
		var jsoncateg=JSON.parse($('#JSONCategoriasNube').html());
		var jsoncategorias=jsoncateg.Categorias;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
				tx.executeSql('delete from categorias',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='CATEGORIAS'",[],function(tx,results){});
				
			for(var n=0;n<jsoncategorias.length;n++){
				var item=jsoncategorias[n];
				var timeSpanCat=getTimeSpan();
				tx.executeSql("INSERT OR IGNORE INTO CATEGORIAS(categoria,activo,existe,timespan,sincronizar)values('"+item.categoria_nombre+"','1','1','"+item.categoria_timespan+"','false');",[],function(tx,results){
					console.log("insertada categ:"+results.insertId);
				});
			}
			},errorCB,function(){
				localStorage.setItem("categoriasya",true);
				$("#theProgress").css("width" , "15%");
				ExtraeDatosApi(2);
			});
			
	}else if(donde==2){
		console.log("Datos API 2: Productos");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Productos...");
		var jsonprod=JSON.parse($('#JSONproductosNube').html());
		var jsonproductos=jsonprod.Productos;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
				tx.executeSql('delete from productos',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='PRODUCTOS'",[],function(tx,results){});
			for(var n=0;n<jsonproductos.length;n++){
				var item=jsonproductos[n];
				tx.executeSql('INSERT OR IGNORE INTO PRODUCTOS(formulado,codigo,precio,categoriaid,cargaiva,productofinal,materiaprima,timespan,servicio,sincronizar,color,estado) VALUES("'+item.formulado_nombre+'", "'+item.formulado_codigo+'" ,'+item.formulado_precio+','+item.categoria_timespan+','+item.cargaiva+','+item.formulado_productofinal+','+item.formulado_matprima+',"'+item.formulado_timespan+'",'+item.carga_servicio+',"false","'+item.color+'",'+item.activo+')',[],function(tx,results){
				console.log("insertado producto:"+results.insertId);
				});
			}
			},errorCB,function(){
				localStorage.setItem("productosya",true);
				$("#theProgress").css("width" , "30%");
				ExtraeDatosApi(3);
			});
		
	}else if(donde==3){
		console.log("Datos API 3: Clientes");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Clientes...");
		var jsoncli=JSON.parse($('#JSONclientesNube').html());
		//{"Clientes":[{"id":"1","nombre":" Consumidor Final","cedula":"9999999999999","telefono":"","direccion":"","email":"","timespan" : "0"}]}
		var jsonclientes=jsoncli.Clientes;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
			tx.executeSql('delete from clientes',[],function(tx,results){});
			tx.executeSql("delete from sqlite_sequence where name='CLIENTES'",[],function(tx,results){});
			for(var n=0;n<jsonclientes.length;n++){
				var item=jsonclientes[n];
				tx.executeSql('INSERT OR IGNORE INTO CLIENTES(nombre,cedula,email,direccion,telefono,sincronizar,existe,timespan) VALUES("'+item.nombre+'" , "'+item.cedula+'" , "'+item.email+'" , "'+item.direccion+'" ,  "'+item.telefono+'" ,  "false" , "0" , "0" )',[],function(tx,results){
				console.log("insertado cliente:"+results.insertId);
				});
			}
			},errorCB,function(){
				localStorage.setItem("clientesya",true);
				$("#theProgress").css("width" , "45%");
				ExtraeDatosApi(4);
			});
	}else if(donde==4){
		console.log("Datos API 4: Presupuesto");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Presupuesto...");
		var jsonpres=JSON.parse($('#JSONpresupuestoNube').html());
		var jsonpresupuestos=jsonpres.presupuesto;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx){
				tx.executeSql('delete from presupuesto',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='PRESUPUESTO'",[],function(tx,results){});
				for(var n=0;n<jsonpresupuestos.length;n++){
					var item=jsonpresupuestos[n];
					tx.executeSql('INSERT OR IGNORE INTO PRESUPUESTO(timespan,valor,fecha,transacciones) VALUES("'+item.timespan+'",'+item.valor+','+item.fecha+','+item.transacciones+')',[],function(tx,results){
					console.log("insertado presupuesto:"+results.insertId);
					});
				}
		},errorCB,function(){
				localStorage.setItem("presupuestoya",true);
				$("#theProgress").css("width" , "60%");
				ExtraeDatosApi(5);
		});
	}else if(donde==5){
		console.log("Datos API 5: Categorias Menu");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Categorias Menu Diseño...");
		var jsonpres=JSON.parse($('#JSONCatMenuNube').html());
		var jsonpresupuestos=jsonpres.menucategorias;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx){
				tx.executeSql('delete from MENU_CATEGORIAS',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='MENU_CATEGORIAS'",[],function(tx,results){});
				for(var n=0;n<jsonpresupuestos.length;n++){
					var item=jsonpresupuestos[n];
					tx.executeSql('INSERT OR IGNORE INTO MENU_CATEGORIAS(orden,nombre,timespan,activo)VALUES('+item.orden+',"'+item.nombre+'","'+item.timespan+'","'+item.activo+'")',[],function(tx,results){
					console.log("insertada Categoria Menu:"+results.insertId);
					});
				}
		},errorCB,function(){
				localStorage.setItem("menucategoriasya",true);
				$("#theProgress").css("width" , "85%");
				ExtraeDatosApi(6);
		});
	}else if(donde==6){
		console.log("Datos API 6: Menu");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Menu...");
		var jsonpres=JSON.parse($('#JSONMenuNube').html());
		var jsonpresupuestos=jsonpres.menu;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx){
				tx.executeSql('delete from MENU',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='MENU'",[],function(tx,results){});
				for(var n=0;n<jsonpresupuestos.length;n++){
					var item=jsonpresupuestos[n];
					
					//tx.executeSql('INSERT INTO MENU (fila,columna,idcatmenu,idproducto,timespan,activo) VALUES('+(parseInt(item.fila)+1)+','+item.columna+',"'+item.idcatmenu+'","'+item.idproducto+'","'+item.timespan+'","'+item.activo+'")',[],function(tx,results){
					tx.executeSql('INSERT INTO MENU(fila,columna,idcatmenu,idproducto,timespan,activo) SELECT '+(parseInt(item.fila)+1)+','+item.columna+',"'+item.idcatmenu+'","'+item.idproducto+'","'+item.timespan+'","'+item.activo+'" WHERE NOT EXISTS(SELECT 1 FROM MENU WHERE timespan like "'+item.timespan+'")',[],function(tx,results){
							console.log("insertado producto menu inicio:"+results.insertId);
					});
					//console.log("insertado producto de menu:"+results.insertId);
					//});
				}
		},errorCB,function(){
				localStorage.setItem("menuya",true);
				$("#theProgress").css("width" , "95%");
				ExtraeDatosApi(7);
		});
	}else if(donde==7){
		console.log("Datos API 7: Permisos");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Permisos...");
		//alert($('#JSONPermisosNube').html());
		var jsonpres=JSON.parse($('#JSONPermisosNube').html());
		var jsonpresupuestos=jsonpres.permisos;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx){
				tx.executeSql('delete from PERMISOS',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='PERMISOS'",[],function(tx,results){});
				for(var n=0;n<jsonpresupuestos.length;n++){
					var item=jsonpresupuestos[n];
					tx.executeSql('INSERT OR IGNORE INTO PERMISOS (clave,historial,configuracion,anular,impcierre,productos,activo) VALUES("'+item.clave+'","'+item.historial+'","'+item.configuracion+'","'+item.anular+'","'+item.imprimircierre+'","'+item.productos+'","'+item.activo+'")',[],function(tx,results){
					console.log("insertado permiso:"+results.insertId);
					});
				}
		},errorCB,function(){
				localStorage.setItem("permisosya",true);
				$("#theProgress").css("width" , "100%");
				setTimeout(function(){SyncStart()},1500);
		});
	}
}

function SincronizadorNormal(){
	console.log("sincronizador normal");
	procesocount=1;
	$('#fadeRow,#demoGratis,#finalizado').css("display","none");
	$('#contentStepSincro,#cuentaactiva,#mensajeperso').fadeIn();
	DatosRecurrentes(0);
}

function registrarUser(){
	newEmpresa=$("#newEmpresa").val();
	newEmail=$("#newEmail").val();
	newPass=$("#newPass").val();
	newConfirm=$("#newConfirm").val();
    var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(newEmpresa==''){
        $('.alert-danger').fadeIn('slow');
        $(".alert-danger").html('Debe ingresar el nombre de tu negocio.');
        $("#newEmpresa").val('');
        setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
     }else if(newEmail=='' || !expr.test(newEmail)){
        $('.alert-danger').fadeIn('slow');
        $(".alert-danger").html('Debe ingresar un e-mail valido para tu negocio.');
        $("#newEmail").val('');
        setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
     }else{
    	if(newConfirm == newPass){
			$("#cargandoTabs").fadeIn();
    		var nombre=newEmpresa;
    		var celular='';
    		var email=newEmail;
    		var passw=newPass;
    		var rpassw=newConfirm;
    		var empresa=newEmpresa;
    		var planPrecio=2;
    		var nTerminales=1;
    		var sistema=0;
    		var franquicia=0;
    		var pais=1;
    		var versiones=7;
			var plan=0;
			var iddevice=$('#deviceid').html();
			//alert(iddevice+'/'+nombre+'/'+email+'/'+nombre);
    		$("#btnNewEmp").html('<img src="images/loader.gif"  width="50%" />');
    		$.post("https://practisis.net/registro/registroNubePOS.php", {
    			nombre : nombre,
    			celular : celular,
    			email :newEmail,
    			pass : newPass,
    			rpass : newConfirm,
    			empresa : empresa,
    			planPrecio : planPrecio,
    			nTerminales : nTerminales,
    			sistema : sistema,
    			pais : pais,
    			franquicia : franquicia,
    			versiones : versiones,
				deviceid:iddevice
    		}).done(function(data){
				//alert(data);
                if(data=='existe'){
						$("#cargandoTabs").fadeOut();
                        $('.alert-danger').fadeIn('slow');
                        $(".alert-danger").html('El correo ingresado ya existe en el sistema, vuelva a ingresar otro correo.');
                        $("#newEmail").val('');
                            setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
    			}else{
						var datosback=data.split("||");
						console.log(data);
        				localStorage.setItem("userRegister", newEmail);
        				localStorage.setItem("userPasswod", newPass);
						localStorage.setItem("empresa",datosback[0]);
						localStorage.setItem("idbarra",datosback[1]);
						localStorage.setItem("categoriasya",true);
						localStorage.setItem("clientesya",true);
						localStorage.setItem("productosya",true);
						localStorage.setItem("presupuestoya",true);
						
						var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
						db.transaction(iniciaDB,errorCB,function(){SetDataEmpresa(nombre,celular,newEmail,iddevice,datosback[1],'','','',false);});
						
                }
    		});

    	}else{
				$("#cargandoTabs").fadeOut();
    			$('.alert-danger').fadeIn('slow');
                $(".alert-danger").html('Las contraseñas son distintas.');
                $("#newPass").val('');
    			$("#newConfirm").val('');
                setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
    		}
        }
}


function LaunchBoarding(){
	$('.navbar').slideDown();
	$('#myDash').fadeIn('slow',function(){
        setTimeout(function() {$("#menu_1").effect('highlight',{},1500);},1000);
    });
}

function SetDataEmpresa(nombre,celular,email,deviceid,id_barra_arriba,ruc,direccion,tablet,desde_login){
	if(tablet==''){
		tablet='Tablet '+$('#devicemodel').html();
	}
	var db2 = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db2.transaction(
		function (tx){
			tx.executeSql('INSERT INTO CONFIG (nombre,razon,telefono,email,ruc,direccion,nombreterminal) VALUES(?,?,?,?,?,?,?)',[nombre,nombre,celular,email,ruc,direccion,tablet],function(tx,res){
				$('#msjOk').html('Informacion Ingresada con Éxito');
				$('#msjOk').fadeIn('slow');
				$('#campos').css('display','none');
				setTimeout(function() {
					$('#msjOk').fadeOut('slow');
				}, 3000);
				});
				
		},errorCB,function(){$('#JSONempresaLocal').html('"empresa":{'+'"nombre":"'+nombre+'","direccion":"'+direccion+"-"+celular+'"},');});
		
	
	db2.transaction(
		function (tx2){
			tx2.executeSql("INSERT INTO empresa (nombre,nombreempresa,id_barra,barra_arriba) VALUES (?,?,?,?)",[nombre,nombre,deviceid,id_barra_arriba],
			function(tx2,res){
				if(!desde_login){
					LaunchBoarding();
					envia("dashboard");
				}else{
					tx2.executeSql('SELECT count(*) as cp FROM PRODUCTOS WHERE id_local !=-1',[],function(tx,results){
						if(results.rows.item(0).cp==0||results.rows.item(0).cp==null){
							LaunchBoarding();
						}
					});
					SyncStart();
				}
								
			});						
									
	},errorCB,successCB);
	
}


function UserLogin(){
	var quien=$("#user2").val();
	var pass=$("#pass2").val();
	var iddevice=$('#deviceid').html();
    auxuser = quien;
    auxpass = pass;
	$('#btnvalida2').html("<img src='images/loader.gif' width='20px'/>");
	$.post(apiURL,{action:"login", user : quien , pass : pass, deviceid : iddevice}).done(function(data){
		//alert(quien+'/'+pass+'/'+iddevice);
		//alert(data);
		if(data=='error'){
			showalert('Los datos son incorrectos.');
		}
		else{
			var datosaux = data.split("||");
			localStorage.setItem("userRegister", quien);
			localStorage.setItem("userPasswod", pass);
			localStorage.setItem("empresa",datosaux[0]);
			localStorage.setItem("idbarra",datosaux[2]);
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(iniciaDB,errorCB,function(){SetDataEmpresa(datosaux[1],datosaux[3],quien,iddevice,datosaux[2],datosaux[4],datosaux[5],'',true)});
			$('.navbar').slideDown();
			//function SetDataEmpresa(nombre,celular,email,deviceid,id_barra_arriba,ruc,direccion,desde_login)
			//SetDataEmpresa(datosaux[1],datosaux[3],quien,iddevice,datosaux[2],datosaux[4],datosaux[5],true);
		}
		$('#btnvalida2').html("Login");
	});
}

function DatosIniciales(cual){	
	$.post(apiURL,{
		id_emp: localStorage.getItem("empresa"),
		action: 'SincStart',
		id_barra: localStorage.getItem("idbarra"),
		deviceid:$("#deviceid").html()
	}).done(function(response){
		//sincronizacion inicial
		var arraydatos=JSON.parse(response); 
		console.log(">>>>Iniciar >>>"+response);
		JSONproductosNube=arraydatos.productos;
		JSONcategoriasNube=arraydatos.categorias;
		JSONclientesNube=arraydatos.clientes;
		JSONpresupuestoNube=arraydatos.presupuestos;
		JSONcategoriasMenuNube=arraydatos.menucategorias;
		JSONmenuNube=arraydatos.menu;
		JSONpermisosNube=arraydatos.permisos;
		
		$("#JSONclientesNube").html(JSONclientesNube);
		$("#JSONCategoriasNube").html(JSONcategoriasNube);
		$("#JSONproductosNube").html(JSONproductosNube);	
		$("#JSONpresupuestoNube").html(JSONpresupuestoNube);
		$('#JSONCatMenuNube').html(JSONcategoriasMenuNube);
		$('#JSONMenuNube').html(JSONmenuNube);
		$('#JSONPermisosNube').html(JSONpermisosNube);

		ExtraeDatosApi(cual);
	});
}
		
function DatosRecurrentes(cual){
	if(cual==0){
		$.post(apiURL,{
		id_emp : localStorage.getItem("empresa"),
		action : 'SincTabla',
		id_barra : localStorage.getItem("idbarra"),
		deviceid:$("#deviceid").html()
		}).done(function(response){
			if(response!='block'){
				//console.log(response);
				jsonSync=JSON.parse(response);
				recurrenteJsonEmpresa=jsonSync.BigJson[0].Empresa;
				console.log(response);
				$('#JSONproductosNube').html(JSON.stringify(jsonSync.BigJson[1].Productos));
				$('#JSONclientesNube').html(JSON.stringify(jsonSync.BigJson[2].Clientes));
				$('#JSONCategoriasNube').html(JSON.stringify(jsonSync.BigJson[3].Categorias));
				$('#JSONpresupuestoNube').html(JSON.stringify(jsonSync.BigJson[4].Presupuesto));
				$('#JSONEmpresaNube').html(JSON.stringify(jsonSync.BigJson[0].Empresa));
				$('#JSONMenuNube').html(JSON.stringify(jsonSync.BigJson[6].Menu));
				//$('#JSONMenuNube').html('[{"fila":"1","columna":"1","timespan":"1111","activo":"true","idproducto":"14561567453299778","idcatmenu":"1112"}]');
				$('#JSONCatMenuNube').html(JSON.stringify(jsonSync.BigJson[5].Menucategorias));
				//$('#JSONCatMenuNube').html('[{"orden": "1","nombre": "Categoria 1","timespan": "1112","activo": "true"}]');
				//$('#JSONPermisosNube').html('[{"id":"1","clave": "1111","configuracion": "true","historial": "true","anular": "true","imprimircierre":"true","productos":"false"}]');
				$('#JSONPermisosNube').html(JSON.stringify(jsonSync.BigJson[8].Permisos));
				localStorage.setItem("dias",jsonSync.BigJson[7].Extra[0].dias);
				localStorage.setItem("msj",jsonSync.BigJson[7].Extra[0].msj);
				//localStorage.setItem("permisos",jsonSync.BigJson[5].Extra[0].constrasenia);
				localStorage.setItem("permisos",jsonSync.BigJson[7].Extra[0].contrasenia);
				//localStorage.setItem("claveuser","");
				//localStorage.setItem("msj",jsonSync.BigJson[5].Extra[0].diseno);
				//localStorage.setItem("diseno",1);
				//localStorage.setItem("diseno",0);
				$('#dias').html(localStorage.getItem('dias'));
				$('#mensajeperso').html(localStorage.getItem('msj'));
				console.log( ">>>>>>recurrente");
				DatosRecurrentes(1);
				updateOnlineStatus("ONLINE");
			}else{
				envia('cloud');
				setTimeout(function(){
					$('#linklogin,#linkloginb').attr("href","https://www.practisis.net/index3.php?rvpas="+localStorage.getItem("userPasswod")+"&rvus="+localStorage.getItem("userRegister"));
					$('.navbar').slideUp();
					$("#demoGratis,#fadeRow,#finalizado,#contentStepSincro,#cuentaactiva").css("display","none");
					$('#bloqueo').fadeIn();
				},100);
				
			}
			
		}).fail(function(){
			updateOnlineStatus("OFFLINE");
			setTimeout(function(){SincronizadorNormal()},180000);
		});
	}
	if(cual==1){
		console.log("Datos Nube 1: Categorias");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Categorías...");
		if($('#JSONCategoriasNube').html().length>0){
			var jsoncategorias=JSON.parse($('#JSONCategoriasNube').html());
			console.log(jsoncategorias);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsoncategorias.length;n++){
					var item=jsoncategorias[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.idreal+',');
					
					tx.executeSql("INSERT OR IGNORE INTO CATEGORIAS (categoria,activo,existe,timespan,sincronizar)values('"+item.formulado_tipo+"','1','1','"+item.timespan+"','false')",[],function(tx,results){
						console.log("insertada categ:"+results.insertId);
					});
					
					tx.executeSql("UPDATE CATEGORIAS SET categoria = '"+item.formulado_tipo+"' WHERE timespan='"+item.timespan+"'",[],function(tx,results){
						console.log("actualizada categ");
					});
					
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "15%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('formulados_tipo')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
							localStorage.setItem("dataupdate","");
							DatosRecurrentes(2);
							updateOnlineStatus("ONLINE");
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
					
				});
		}	
	}else if(cual==2){
		console.log("recurrentes 2: Productos");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Productos...");
		if($('#JSONproductosNube').html().length>0){
			var jsonproductos=JSON.parse($('#JSONproductosNube').html());
			console.log(jsonproductos);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonproductos.length;n++){
					var item=jsonproductos[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
					
					tx.executeSql('INSERT OR IGNORE INTO PRODUCTOS(formulado,codigo,precio,categoriaid,cargaiva,productofinal,materiaprima,timespan,servicio,sincronizar,color,estado)VALUES("'+item.formulado+'","'+item.formulado_codigo+'",'+item.precio+',"'+item.formulado_tipo_timespan+'",'+item.ivacompra+','+item.esproductofinal+','+item.esmateria+',"'+item.timespan+'" ,'+item.tieneservicio+',"false","'+item.color+'",'+item.activo+')',[],function(tx,results){
						console.log("insertado prod:"+results.insertId);       
					});
					
					tx.executeSql('UPDATE PRODUCTOS SET formulado="'+item.formulado+'",codigo="'+item.formulado_codigo+'",precio='+item.precio+',categoriaid="'+item.formulado_tipo_timespan+'",cargaiva='+item.ivacompra+',productofinal='+item.esproductofinal+',materiaprima='+item.esmateria+',timespan="'+item.timespan+'",servicio='+item.tieneservicio+',sincronizar="false",color="'+item.color+'",estado='+item.activo+' WHERE timespan="'+item.timespan+'"',[],function(tx,results){
						console.log("actualizado prod");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "30%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('formulados','formulados_precios','formulados_impuestos')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						DatosRecurrentes(3);
						updateOnlineStatus('ONLINE');
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}	
	}else if(cual==3){
		console.log("recurrentes 3: Clientes");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Clientes...");
		if($('#JSONclientesNube').html().length>0){
			var jsonclientes=JSON.parse($('#JSONclientesNube').html());
			console.log(jsonclientes);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonclientes.length;n++){
					var item=jsonclientes[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.idreal+',');
					
					tx.executeSql('INSERT OR IGNORE INTO CLIENTES(nombre,cedula,email,direccion,telefono,sincronizar,existe,timespan) VALUES("'+item.nombre+'" , "'+item.cedula+'" , "'+item.email+'" , "'+item.direccion+'" ,  "'+item.telefono+'" ,  "false" , "0" , "0" )',[],function(tx,results){
						console.log("insertado cliente:"+results.insertId);
					});
					
					tx.executeSql('UPDATE CLIENTES SET nombre=  "'+item.nombre+'"  , cedula = "'+item.cedula+'" , email="'+item.email+'"  , direccion = "'+item.direccion+'" , sincronizar="false"  WHERE cedula="'+item.cedula+'"',[],function(tx,results){
						console.log("actualizado cliente");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "45%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('clientes','clientes_datos')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						DatosRecurrentes(4);
						updateOnlineStatus('ONLINE');
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
		});
		}
	}else if(cual==4){
		console.log("recurrentes 4: Presupuestos");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Presupuesto...");
		if($('#JSONpresupuestoNube').html().length>0){
			var jsonpresup=JSON.parse($('#JSONpresupuestoNube').html());
			console.log(jsonpresup);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonpresup.length;n++){
					var item=jsonpresup[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
					
					tx.executeSql('INSERT OR IGNORE INTO PRESUPUESTO(timespan,valor,fecha,transacciones) VALUES("'+item.id+'",'+item.valor+','+item.fecha+','+item.transacciones+')',[],function(tx,results){
						console.log("insertado presupuesto:"+results.insertId);
					});
					
					tx.executeSql('UPDATE PRESUPUESTO SET timespan=  "'+item.id+'"  , valor = '+item.valor+' , fecha='+item.fecha+', transacciones = '+item.transacciones+' WHERE fecha='+item.fecha,[],function(tx,results){
						console.log("actualizado presupuesto");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "60%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('presupuestos')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						
						console.log(response);
						localStorage.setItem("dataupdate","");
						DatosRecurrentes(5);
						updateOnlineStatus('ONLINE');
						
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}
	}else if(cual==5){
		console.log("recurrentes 5: Empresa");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando datos Empresa...");
		if($('#JSONEmpresaNube').html().length>0){
			var jsonpresup=JSON.parse($('#JSONEmpresaNube').html());
			console.log(jsonpresup);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonpresup.length;n++){
					var item=jsonpresup[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+'1,');
						
					tx.executeSql('UPDATE CONFIG SET nombre="'+item.nombreempresa+'",razon = "'+item.razon+'" , ruc="'+item.ruc+'",telefono ="'+item.telefono+'",direccion="'+item.direccion+'",serie="'+item.serie+'",establecimiento="'+item.establecimiento+'",nombreterminal="'+item.nombreterminal+'" WHERE id=1',[],function(tx,results){
						console.log("actualizada empresa");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "75%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('configuraciones_globales,id_barras_cajas')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						DatosRecurrentes(6);
						updateOnlineStatus('ONLINE');
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}
	}else if(cual==6){
		console.log("recurrentes 6: Categorias Diseño Menu");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Categorías de Menu...");
		if($('#JSONCatMenuNube').html().length>0){
			var jsoncatmenu=JSON.parse($('#JSONCatMenuNube').html());
			console.log(jsoncatmenu);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsoncatmenu.length;n++){
					//alert(n);
					var item=jsoncatmenu[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
					
					tx.executeSql('INSERT OR IGNORE INTO MENU_CATEGORIAS(orden,nombre,timespan,activo)VALUES('+item.orden+',"'+item.nombre+'","'+item.timespan+'","'+item.activo+'")',[],function(tx,results){
						console.log("insertada categoria menu:"+results.insertId);
					});
					
					tx.executeSql('UPDATE MENU_CATEGORIAS SET orden='+item.orden+' , nombre = "'+item.nombre+'", activo = "'+item.activo+'" WHERE timespan like "'+item.timespan+'"',[],function(tx,results){
						console.log("actualizada categoria menu.");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "90%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('menu_categorias')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						DatosRecurrentes(7);
						updateOnlineStatus('ONLINE');
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}
	}	else if(cual==7){
		console.log("recurrentes 7: Productos Diseño de Menu");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando productos Diseño de Menú...");
		if($('#JSONMenuNube').html().length>0){
			var jsonmenu=JSON.parse($('#JSONMenuNube').html());
			console.log(jsonmenu);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
					for(var n=0;n<jsonmenu.length;n++){
						var item=jsonmenu[n];
						localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
						
						/*tx.executeSql('INSERT OR IGNORE INTO MENU(fila,columna,idcatmenu,idproducto,timespan,activo)VALUES('+(parseInt(item.fila)+1)+','+item.columna+',"'+item.idcatmenu+'","'+item.idproducto+'","'+item.timespan+'","'+item.activo+'")',[],function(tx,results){
						console.log("insertado producto menu:"+results.insertId);
						});*/
						tx.executeSql('INSERT INTO MENU(fila,columna,idcatmenu,idproducto,timespan,activo) SELECT '+(parseInt(item.fila)+1)+','+item.columna+',"'+item.idcatmenu+'","'+item.idproducto+'","'+item.timespan+'","'+item.activo+'" WHERE NOT EXISTS(SELECT 1 FROM MENU WHERE timespan like "'+item.timespan+'")',[],function(tx,results){
							console.log("insertado producto menu:"+results.insertId);
						});
						
						tx.executeSql('UPDATE MENU SET fila='+(parseInt(item.fila)+1)+' , columna = '+item.columna+', activo = "'+item.activo+'" ,idproducto="'+item.idproducto+'",idcatmenu="'+item.idcatmenu+'",timespan="'+item.timespan+'" WHERE timespan like "'+item.timespan+'"',[],function(tx,results){
							console.log("actualizado producto menu.");
						});
					}
				},errorCB,function(){
					$("#theProgress").css("width" , "90%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('menu_diseno')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						DatosRecurrentes(8);
						setTimeout(function(){
							$("#theProgress").css("width" , "0%");
							$("#finalizado").fadeIn();
							$("#contentStepSincro").css("display","none");
							$("#txtSincro").html("Sincronizando..");
						},1500);
						updateOnlineStatus('ONLINE');
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}
	}
	else if(cual==8){
		console.log("recurrentes 8: Permisos Usuario");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("Sincronizando Permisos de Usuario...");
		if($('#JSONPermisosNube').html().length>0){
			var jsonpermisos=JSON.parse($('#JSONPermisosNube').html());
			console.log(jsonpermisos);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonpermisos.length;n++){
					var item=jsonpermisos[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
					//tx.executeSql('delete from PERMISOS',[],function(tx,results){});
					//tx.executeSql("delete from sqlite_sequence where name='PERMISOS'",[],function(tx,results){});
					
					tx.executeSql('INSERT OR IGNORE INTO PERMISOS(clave,historial,configuracion,anular,impcierre,productos,activo)VALUES("'+item.clave+'","'+item.historial+'","'+item.configuracion+'","'+item.anular+'","'+item.imprimircierre+'","'+item.productos+'","'+item.activo+'")',[],function(tx,results){
						console.log("insertado permiso :"+results.insertId);
					});
					
					tx.executeSql('UPDATE PERMISOS SET clave="'+item.clave+'" , historial = "'+item.historial+'", configuracion = "'+item.configuracion+'" ,anular="'+item.anular+'",impcierre="'+item.imprimircierre+'",productos="'+item.productos+'",activo="'+item.activo+'" WHERE clave like "'+item.clave+'"',[],function(tx,results){
							console.log("actualizado permiso.");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "95%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('permisos_nube')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						SubirDatosaNube(0);
						updateOnlineStatus('ONLINE');
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}
	}
}

function SubirDatosaNube(cual){
	console.log("sincronizador de subida...");
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	if(cual==0){
		db.transaction(function(tx){
			console.log("subida de categorias");
			tx.executeSql('SELECT * FROM CATEGORIAS WHERE sincronizar="true"',[],function(tx,results){
				console.log(results);
				if(results.rows.length>0){
					var itemsasubir=results.rows;
					console.log(itemsasubir);
					PostaLaNube(itemsasubir,cual,"Categorias",0);
				}else{
					SubirDatosaNube(1);
				}
			});
		},errorCB,successCB);
	}if(cual==1){
		db.transaction(function(tx){
			console.log("subida de productos");
			tx.executeSql('SELECT * FROM PRODUCTOS WHERE sincronizar="true"',[],function(tx,results){
				if(results.rows.length>0){
					var itemsasubir=results.rows;
					PostaLaNube(itemsasubir,cual,"Productos",0);
				}else{SubirDatosaNube(2)}
			});
		},errorCB,successCB);
	}
	/*if(cual==2){
		db.transaction(function(tx){
			console.log("subida de clientes");
			tx.executeSql('SELECT * FROM CLIENTES WHERE sincronizar="true"',[],function(tx,results){
				if(results.rows.length>0){
					var itemsasubir=results.rows;
					PostaLaNube(itemsasubir,cual,"Clientes",0);
				}else{SubirDatosaNube(3)}
			});
		},errorCB,successCB);
	}*/
	if(cual==2){
		db.transaction(function(tx){
			console.log("subida de facturas");
			tx.executeSql('SELECT * FROM FACTURAS WHERE sincronizar="true"',[],function(tx,results){
				if(results.rows.length>0){
					var itemsasubir=results.rows;
					PostaLaNube(itemsasubir,cual,"Facturas",0);
				}else{SubirDatosaNube(3)}
			});
		},errorCB,successCB);
	}
	if(cual==3){
		db.transaction(function(tx){
			console.log("subida de EMPRESA");
			tx.executeSql('SELECT * FROM CONFIG WHERE sincronizar="true"',[],function(tx,results){
				if(results.rows.length>0){
					var itemsasubir=results.rows;
					PostaLaNube(itemsasubir,cual,"Config",0);
				}else{SubirDatosaNube(4)}
			});
		},errorCB,successCB);
	}
	if(cual==4){
		procesocount=0;
		setTimeout(function(){SincronizadorNormal();},60000);
	}
}

function PostaLaNube(arraydatos,cual,accion,t){
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	var item=arraydatos.item(t);
	var jsonc='';
	if(accion=='Categorias'){
		jsonc='{"id":"'+item.id+'","categoria":"'+item.categoria+'","activo":"'+item.activo+'","timeSpan":"'+item.timespan+'"}';
	}else if(accion=='Productos'){
		var boolactivo='true';
		if(item.estado==0)
			boolactivo='false';
		jsonc='{  "id" : "'+item.id_local+'" , "formulado" : "'+item.formulado+'" , "timespan" : "'+item.timespan+'" , "codigo" : "'+item.codigo+'" , "precio" : "'+item.precio+'" , "cargaiva" : "'+item.cargaiva+'" , "categoriaid" : "'+item.categoriaid+'" , "productofinal" : "'+item.productofinal+'" , "materiaprima" : "'+item.materiaprima+'" , "servicio" : "'+item.servicio+'" , "activo" : "'+boolactivo+'","color":"'+item.color+'" }';
	}else if(accion=='Clientes'){
		jsonc='{  "id" : "'+item.id+'" , "cedula" : "'+item.cedula+'" , "nombre" : "'+item.nombre+'"  , "email" : "'+item.email+'" , "direccion" : "'+item.direccion+'" , "telefono" : "'+item.telefono+'" }';
	}else if(accion=='Facturas'){
		jsonc=item.fetchJson;
	}else if(accion=='Config'){
		jsonc='{"nombreempresa":"'+item.nombre+'","razon":"'+item.razon+'","telefono":"'+item.telefono+'","ruc":"'+item.ruc+'","direccion":"'+item.direccion+'","email":"'+item.email+'","serie":"'+item.serie+'","establecimiento":"'+item.establecimiento+'","nombreterminal":"'+item.nombreterminal+'"}';
	}
	
	console.log(jsonc);
	
	$.post(apiURL,{
		id_emp: localStorage.getItem("empresa"),
		action: accion,
		id_barra: localStorage.getItem("idbarra"),
		json:jsonc,
		deviceid:$("#deviceid").html()
	}).done(function(response){
		console.log(response);
		if(parseInt(response)>0){
			db.transaction(function(tx){
				var sentencia='UPDATE '+accion+' SET sincronizar="false" WHERE timespan="'+item.timespan+'"';
				if(accion=='Clientes')
				sentencia='UPDATE '+accion+' SET sincronizar="false" WHERE cedula="'+item.cedula+'"';
				
				if(accion=='Config')
				sentencia='UPDATE '+accion+' SET sincronizar="false" WHERE id=1';

				tx.executeSql(sentencia,[],function(tx,results){});
			},errorCB,function(){
				if(t<arraydatos.length-1){
					t++;
					PostaLaNube(arraydatos,cual,accion,t);
				}else{
					console.log("Subir a la nube 2");
					SubirDatosaNube(cual+1);
				}
			});
		}else{
			if(t<arraydatos.length-1){
				t++;
				PostaLaNube(arraydatos,cual,accion,t);
			}
			else{
				console.log("Subir a la nube 2");
				SubirDatosaNube(cual+1);
			}
		}
		updateOnlineStatus("ONLINE");
	}).fail(function(){
			updateOnlineStatus("OFFLINE");
			setTimeout(function(){SincronizadorNormal()},180000);
	});
} 

//-----------------------------------Fin nuevo---------------