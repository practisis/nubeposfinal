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
	var mesasya = localStorage.getItem('mesasya');
	
	//setea el session storage de la mesa
	sessionStorage.setItem("mesa_activa","");
	//
	
	//console.log(idbarra+'*'+categoriasya+'*'+productosya+'*'+clientesya);
	if((clientesya||productosya||categoriasya||presupuestoya||menucategoriasya||menuya||permisosya||idbarra)&&mesasya==false){
		envia('cloud');
		localStorage.setItem("idioma",2);
		$('.navbar').slideDown();
	}
	if(mesasya){
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
	}else if(permisosya){
		ExtraeDatosApi(8);
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
		localStorage.setItem("idioma",2);
		envia('cloud');
	}else if(donde==1){
		console.log("Datos API 1: Categorias");
		//$(".navbar").slideUp();
		$("#demoGratis,#fadeRow,#finalizado").css("display","none");
		$("#contentStepSincro,#cuentaactiva,#mensajeperso").fadeIn();
		$("#txtSincro").html("0%");
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
		console.log("Datos API 2: Productos y Agregados");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("15%");
		
		/*Agregar modificadores*/
		var jsonmodif=JSON.parse($('#JSONModifNube').html());
		var jsonmodificadores=jsonmodif.modificadores;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
				tx.executeSql('delete from MODIFICADORES',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='MODIFICADORES'",[],function(tx,results){});
			for(var n=0;n<jsonmodificadores.length;n++){
				var item=jsonmodificadores[n];		
				tx.executeSql('INSERT OR IGNORE INTO MODIFICADORES(no_modificador,id_formulado,nombre,valor,id_formulado_descuento,activo,timespan) VALUES('+item.no_modif+', "'+item.id_formulado+'" ,"'+item.nombre+'",'+item.valor+',"'+item.id_form_desc+'","'+item.activo+'","'+item.timespan+'")',[],function(tx,resultsm){
				console.log("insertado producto:"+resultsm.insertId);
				});
			}
			},errorCB,successCB);
		/*FIN MODIFICADORES*/
		
		var jsonprod=JSON.parse($('#JSONproductosNube').html());
		var jsonproductos=jsonprod.Productos;
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
				tx.executeSql('delete from productos',[],function(tx,results){});
				tx.executeSql("delete from sqlite_sequence where name='PRODUCTOS'",[],function(tx,results){});
			for(var n=0;n<jsonproductos.length;n++){
				var item=jsonproductos[n];
				tx.executeSql('INSERT OR IGNORE INTO PRODUCTOS(formulado,codigo,precio,categoriaid,cargaiva,productofinal,materiaprima,timespan,servicio,sincronizar,color,estado,tieneimpuestos) VALUES("'+item.formulado_nombre+'", "'+item.formulado_codigo+'" ,'+item.formulado_precio+','+item.categoria_timespan+','+item.cargaiva+','+item.formulado_productofinal+','+item.formulado_matprima+',"'+item.formulado_timespan+'",'+item.carga_servicio+',"false","'+item.color+'",'+item.activo+',"'+item.tieneimpuestos+'")',[],function(tx,results){
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
		$("#txtSincro").html("30%");
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
		$("#txtSincro").html("45%");
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
		$("#txtSincro").html("60%");
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
		$("#txtSincro").html("85%");
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
		$("#txtSincro").html("95%");
		//alert($('#JSONPermisosNube').html());
		
		/*json permisos extra*/
		if($('#JSONExtraNube').html()!=''){
			var jsonextra=JSON.parse($('#JSONExtraNube').html());
			var ext=jsonextra.extras;
			//console.log(ext[0]);
			localStorage.setItem("permisos",ext[0].contrasenia);
			localStorage.setItem("msj",ext[0].msj);
			localStorage.setItem("dias",ext[0].dias);
			localStorage.setItem("ultimafact",ext[0].num_factura);

			localStorage.setItem("sin_documento",ext[0].documento);
            localStorage.setItem("con_shop",ext[0].shop);
            localStorage.setItem("idioma",ext[0].idioma);
            localStorage.setItem("con_nombre_orden",ext[0].orden);
            localStorage.setItem("propina",ext[0].propina);
            localStorage.setItem("con_tarjeta",ext[0].tarjeta);
			
			localStorage.setItem("con_notas",ext[0].notas);
			localStorage.setItem("con_comandas",ext[0].comanderas);
			//localStorage.setItem("con_mesas",ext[0].comanderas);
			localStorage.setItem("con_mesas",true);

            localStorage.setItem("con_localhost",ext[0].localhost);
            localStorage.setItem("ip_servidor",ext[0].ipservidor);

            var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
              tx.executeSql('UPDATE CONFIG SET pais="'+ext[0].pais+'",id_idioma = "'+ext[0].idioma+'",sin_documento="'+ext[0].documento+'",con_nombre_orden="'+ext[0].orden+'",con_propina="'+ext[0].propina+'",con_tarjeta="'+ext[0].tarjeta+'",con_shop="'+ext[0].shop+'",ip_servidor="'+ext[0].ipservidor+'" WHERE id=1',[],function(tx,results){
  				console.log("actualizada empresa permisos");
  			  });
            },errorCB,function(){
				localStorage.setItem("permisosya",true);
				$("#theProgress").css("width" , "98%");
				ExtraeDatosApi(8);
			});
		}
	}else if(donde==8){
			
		console.log("Datos API 8: Mesas");
		//$(".navbar").slideUp();
		$("#demoGratis").css("display","none");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("98%");
		//alert($('#JSONPermisosNube').html());
		
		/*json tipos de mesa extra*/
		if($('#JSONTipoMesasNube').html()!=''){
			var jsontipomesa=JSON.parse($('#JSONTipoMesasNube').html());
			var jsontipodemesas=jsontipomesa.tipomesas;
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
					tx.executeSql('delete from TIPO_MESA',[],function(tx,results){});
					tx.executeSql("delete from sqlite_sequence where name='TIPO_MESA'",[],function(tx,results){});
					for(var n=0;n<jsontipodemesas.length;n++){
						var item=jsontipodemesas[n];
						
						//tx.executeSql('INSERT INTO MENU (fila,columna,idcatmenu,idproducto,timespan,activo) VALUES('+(parseInt(item.fila)+1)+','+item.columna+',"'+item.idcatmenu+'","'+item.idproducto+'","'+item.timespan+'","'+item.activo+'")',[],function(tx,results){
						tx.executeSql('INSERT INTO TIPO_MESA(imagen_activa,imagen_inactiva,es_mesa,timespan) SELECT "'+item.imagen_activa+'","'+item.imagen_inactiva+'","'+item.es_mesa+'","'+item.id+'" WHERE NOT EXISTS(SELECT 1 FROM TIPO_MESA WHERE timespan like "'+item.id+'")',[],function(tx,results){
								console.log("insertado tipo de mesa inicio:"+results.insertId);
						});
						//console.log("insertado producto de menu:"+results.insertId);
						//});
					}
			},errorCB,successCB);
		}
		/**/
		
		/*json mesas*/
		if($('#JSONMesasNube').html()!=''){
			var jsonmesa=JSON.parse($('#JSONMesasNube').html());
			var jsondemesas=jsonmesa.mesas;
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
					tx.executeSql('delete from MESAS',[],function(tx,results){});
					tx.executeSql("delete from sqlite_sequence where name='MESAS'",[],function(tx,results){});
					for(var n=0;n<jsondemesas.length;n++){
						var item=jsondemesas[n];
						
						//tx.executeSql('INSERT INTO MENU (fila,columna,idcatmenu,idproducto,timespan,activo) VALUES('+(parseInt(item.fila)+1)+','+item.columna+',"'+item.idcatmenu+'","'+item.idproducto+'","'+item.timespan+'","'+item.activo+'")',[],function(tx,results){
						tx.executeSql('INSERT INTO MESAS(left,top,id_tipomesa,activo,nombre,timespan,tab) SELECT '+item.left+','+item.top+',"'+item.tipo_mesa+'","'+item.activo+'","'+item.nombre+'","'+item.id+'","'+item.tab+'" WHERE NOT EXISTS(SELECT 1 FROM MESAS WHERE timespan like "'+item.id+'")',[],function(tx,results){
								console.log("insertado mesa inicio:"+results.insertId);
						});
						//console.log("insertado producto de menu:"+results.insertId);
						//});
					}
			},errorCB,function(){
				localStorage.setItem("mesasya",true);
				$("#theProgress").css("width" , "100%");
				setTimeout(function(){SyncStart()},1500);
			});
		}
		/**/
		
		
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
    newPais=$("#newPais").val();
	newEmail=$("#newEmail").val();
	newPass=$("#newPass").val();
	newConfirm=$("#newConfirm").val();
    newIdioma = $("#id_idioma").val();
    var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(newEmpresa==''){
        $('.alert-danger').fadeIn('slow');
		if(localStorage.getItem("idioma")==1)
			$(".alert-danger").html('Debe ingresar el nombre de su negocio.');
		else if(localStorage.getItem("idioma")==2)
			$(".alert-danger").html('Please, enter a business name.');
		
        $("#newEmpresa").val('');
        setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
     }else if(newPais=='' || newPais=='0'){
        $('.alert-danger').fadeIn('slow');
        if(localStorage.getItem("idioma")==1)
			$(".alert-danger").html('Debe ingresar su país para tu negocio.');
		else if(localStorage.getItem("idioma")==2)
			$(".alert-danger").html('Please, enter a country.');
        setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
     }else if(newEmail=='' || !expr.test(newEmail)){
        $('.alert-danger').fadeIn('slow');
		if(localStorage.getItem("idioma")==1)
			$(".alert-danger").html('Debe ingresar un e-mail valido para su negocio.');
		else if(localStorage.getItem("idioma")==2)
			 $(".alert-danger").html('Enter a valid e-mail.');
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
    		var pais=newPais;
    		var versiones=7;
			var plan=0;
            var id_idioma = 1;
			var iddevice=$('#deviceid').html();
			//alert(iddevice+'/'+nombre+'/'+id_idioma+'/'+nombre);
    		//$("#btnNewEmp").html('<img src="images/loader.gif"  width="50%" />');
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
                id_idioma : newIdioma,
				deviceid:iddevice
    		}).done(function(data){
				//alert(data);
                if(data=='existe'){
						$("#cargandoTabs").fadeOut();
                        $('.alert-danger').fadeIn('slow');
						if(localStorage.getItem("idioma")==1)
                        $(".alert-danger").html('El correo ingresado ya existe en el sistema, vuelva a ingresar otro correo.');
						else if(localStorage.getItem("idioma")==1)
                        $(".alert-danger").html('The mail entered already exists in the system, please enter another.');
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
						localStorage.setItem("menucategoriasya",true);
						localStorage.setItem("menuya",true);
						localStorage.setItem("permisosya",true);
						localStorage.setItem("mesasya",true);
						
						var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
						db.transaction(iniciaDB,errorCB,function(){SetDataEmpresa(nombre,celular,newEmail,iddevice,datosback[1],'','','',false);});
						
                }
    		});

    	}else{
				$("#cargandoTabs").fadeOut();
    			$('.alert-danger').fadeIn('slow');
				if(localStorage.getItem("idioma")==1)
					$(".alert-danger").html('Las contraseñas son distintas.');
				else if(localStorage.getItem("idioma")==2)
					$(".alert-danger").html('The passwords are different.');
                $("#newPass").val('');
    			$("#newConfirm").val('');
                setTimeout(function(){ $('.alert-danger').fadeOut('slow'); }, 3000);
    		}
        }
}


function LaunchBoarding(){
	$('.navbar').slideDown();
	$('#myDash').fadeIn('slow',function(){
        //setTimeout(function() {$("#menu_1").effect('highlight',{},1500);},1000);
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
			if(localStorage.getItem("idioma")==1)
				showalert('Los datos son incorrectos.');
			else if(localStorage.getItem("idioma")==2)
				showalert('Please, enter valid information.');
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
        if(response!='block' && response!='Desactivado'){
    		var arraydatos=JSON.parse(response);
    		console.log(">>>>Iniciar >>>"+response);
    		JSONproductosNube=arraydatos.productos;
    		JSONcategoriasNube=arraydatos.categorias;
    		JSONclientesNube=arraydatos.clientes;
    		JSONpresupuestoNube=arraydatos.presupuestos;
    		JSONcategoriasMenuNube=arraydatos.menucategorias;
    		JSONmenuNube=arraydatos.menu;
    		JSONpermisosNube=arraydatos.permisos;
    		JSONextraNube=arraydatos.extras;
    		JSONimpuestosNube=arraydatos.impuestos;
    		JSONmodificadoresNube=arraydatos.modificadores;
			JSONpropinasNube=arraydatos.propinas;
			JSONTipoMesasNube=arraydatos.tipomesas;
			JSONMesasNube=arraydatos.mesas;
			//JSONTipoMesasNube='{"tipomesas":[{"id":"1","imagen_activa":"mesagrandeanchaa.png","imagen_inactiva":"mesagrandeanchai.png","es_mesa":"true"},	{"id":"2","imagen_activa":"mesagrandealtaa.png","imagen_inactiva":"mesagrandealtai.png","es_mesa":"true"}]}';
			
			//JSONMesasNube='{"mesas":[{"id":"1","left":"780","top":"120","tipo_mesa":"1","nombre":"Mesa 1","activo":"true"},{"id":"2","left":"100","top":"120","tipo_mesa":"2","nombre":"Mesa 2","activo":"true"}]}';
			
			
			//JSONmodificadoresNube=arraydatos.propinas;
    		//JSONimpuestosNube='{"impuestos":[{"id":"1","nombre":"IVA","porcentaje":"12","activo":"true","timespan":"1245"},{"id":"2","nombre":"Servicio","porcentaje":"10","activo":"true","timespan":"1246"}]}';

    		//JSONmodificadoresNube='{"modificadores":[{"id":"1","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"2","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal2","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"3","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal3","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"4","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal4","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"5","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal5","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"6","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal6","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"7","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal7","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"8","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal8","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"2","no_modif":"2","id_formulado":"708331454520391001","nombre":"Con Limon","valor":"0.10","activo":"true","id_form_desc":"0"}]}';
    		//console.log(JSONextraNube);

    		$("#JSONclientesNube").html(JSONclientesNube);
    		$("#JSONCategoriasNube").html(JSONcategoriasNube);
    		$("#JSONproductosNube").html(JSONproductosNube);
    		$("#JSONpresupuestoNube").html(JSONpresupuestoNube);
    		$('#JSONCatMenuNube').html(JSONcategoriasMenuNube);
    		$('#JSONMenuNube').html(JSONmenuNube);
    		$('#JSONPermisosNube').html(JSONpermisosNube);
    		$('#JSONExtraNube').html(JSONextraNube);
    		$('#JSONImpuestosNube').html(JSONimpuestosNube);
    		$('#JSONModifNube').html(JSONmodificadoresNube);
    		$('#JSONPropinasNube').html(JSONpropinasNube);
    		$('#JSONTipoMesasNube').html(JSONTipoMesasNube);
    		$('#JSONMesasNube').html(JSONMesasNube);

    		ExtraeDatosApi(cual);
        }else if(response=='Desactivado'){
    	    envia('cloud');
            $('#myDash').fadeOut();
    		setTimeout(function(){
    			$('.navbar').slideUp();
    			$("#demoGratis,#fadeRow,#finalizado,#contentStepSincro,#cuentaactiva").css("display","none");
    			$('#desactivo').fadeIn();
    		},100);
    	}else{
    		envia('cloud');
            $('#myDash').fadeOut();
    		setTimeout(function(){
    			$('#linklogin,#linkloginb').attr("href","https://www.practisis.net/index3.php?rvpas="+localStorage.getItem("userPasswod")+"&rvus="+localStorage.getItem("userRegister"));
    			$('.navbar').slideUp();
    			$("#demoGratis,#fadeRow,#finalizado,#contentStepSincro,#cuentaactiva").css("display","none");
    			$('#bloqueo').fadeIn();
    		},100);

    	}
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
			if(response!='block' && response!='Desactivado'){
				//console.log(response);
				jsonSync=JSON.parse(response);
				recurrenteJsonEmpresa=jsonSync.BigJson[0].Empresa;
				//console.log(response);
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
				$('#JSONImpuestosNube').html(JSON.stringify(jsonSync.BigJson[9].Impuestos));
				$('#JSONModifNube').html(JSON.stringify(jsonSync.BigJson[10].Modificadores));
				$('#JSONPropinasNube').html(JSON.stringify(jsonSync.BigJson[11].Propinas));
				$('#JSONTipoMesasNube').html(JSON.stringify(jsonSync.BigJson[12].Tipomesas));
				$('#JSONMesasNube').html(JSON.stringify(jsonSync.BigJson[13].Mesas));
				
				//$('#JSONTipoMesasNube').html('{"tipomesas":[{"id":"1","imagen_activa":"mesagrandeanchaa.png","imagen_inactiva":"mesagrandeanchai.png","es_mesa":"true"},	{"id":"2","imagen_activa":"mesagrandealtaa.png","imagen_inactiva":"mesagrandealtai.png","es_mesa":"true"}]}');
			
				//$('#JSONMesasNube').html('{"mesas":[{"id":"1","left":"780","top":"120","tipo_mesa":"1","nombre":"Mesa 1","activo":"true"},{"id":"2","left":"100","top":"120","tipo_mesa":"2","nombre":"Mesa 2","activo":"true"}]}');
				//$('#JSONPropinasNube').html('{"propinas":[{"id":"1","porcentaje":"true","valor":"5","activo":"true"},{"id":"2","porcentaje":"false","valor":"10","activo":"true"}]}');
				//$('#JSONimpuestosNube').html('{"impuestos":[{"id":"1","nombre":"IVA","porcentaje":"12","activo":"true","timespan":"1245"},{"id":"2","nombre":"Servicio","porcentaje":"10","activo":"true","timespan":"1246"}]}');
				
				//$('#JSONModifNube').html('{"modificadores":[{"id":"1","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"2","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal2","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"3","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal3","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"4","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal4","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"5","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal5","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"6","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal6","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"7","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal7","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"8","no_modif":"1","id_formulado":"708331454520391001","nombre":"Con Sal8","valor":"0.15","activo":"true","id_form_desc":"0"},{"id":"2","no_modif":"2","id_formulado":"708331454520391001","nombre":"Con Limon","valor":"0.10","activo":"true","id_form_desc":"0"}]}');
				
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
			}else if(response=='Desactivado'){
			    envia('cloud');
				setTimeout(function(){
					$('.navbar').slideUp();
					$("#demoGratis,#fadeRow,#finalizado,#contentStepSincro,#cuentaactiva").css("display","none");
					$('#desactivo').fadeIn();
				},100);
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
		$("#txtSincro").html("0");
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
		console.log("recurrentes 2: Productos y Modificadores");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("15%");
		
		/*Ingreso y actualizacion de modificadores*/
		if($('#JSONModifNube').html()!=''){
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			localStorage.setItem('dataupdate','');
			db.transaction(function(tx){
			var jsonmodif=JSON.parse($('#JSONModifNube').html());
			for(var n=0;n<jsonmodif.length;n++){
					var item=jsonmodif[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
						
					tx.executeSql('INSERT OR IGNORE INTO MODIFICADORES(no_modificador,id_formulado,nombre,valor,id_formulado_descuento,activo,timespan) VALUES('+item.no_modif+', "'+item.id_formulado+'" ,"'+item.nombre+'",'+item.valor+',"'+item.id_form_desc+'","'+item.activo+'","'+item.timespan+'")',[],function(tx,resultsm){
						console.log("insertado modificador:"+resultsm.insertId);
					});
						
					tx.executeSql('UPDATE MODIFICADORES SET no_modificador=?,id_formulado=?,nombre=?,valor=?,id_formulado_descuento=?,activo=?,timespan=? WHERE nombre like ?',[item.no_modif,item.id_formulado,item.nombre,item.valor,item.id_form_desc,item.activo,item.nombre,item.timespan],function(tx,resultsm){
						console.log("actualizado modificador:"+item.nombre);
					});
				}
			},errorCB,successCB);
		}
		/**/
		if($('#JSONproductosNube').html().length>0){
			var jsonproductos=JSON.parse($('#JSONproductosNube').html());
			console.log(jsonproductos);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonproductos.length;n++){
					var item=jsonproductos[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
					
					tx.executeSql('INSERT OR IGNORE INTO PRODUCTOS(formulado,codigo,precio,categoriaid,cargaiva,productofinal,materiaprima,timespan,servicio,sincronizar,color,estado,tieneimpuestos)VALUES("'+item.formulado+'","'+item.formulado_codigo+'",'+item.precio+',"'+item.formulado_tipo_timespan+'",'+item.ivacompra+','+item.esproductofinal+','+item.esmateria+',"'+item.timespan+'" ,'+item.tieneservicio+',"false","'+item.color+'",'+item.activo+',"'+item.tieneimpuestos+'")',[],function(tx,results){
						console.log("insertado prod:"+results.insertId);       
					});
					
					tx.executeSql('UPDATE PRODUCTOS SET formulado="'+item.formulado+'",codigo="'+item.formulado_codigo+'",precio='+item.precio+',categoriaid="'+item.formulado_tipo_timespan+'",cargaiva='+item.ivacompra+',productofinal='+item.esproductofinal+',materiaprima='+item.esmateria+',timespan="'+item.timespan+'",servicio='+item.tieneservicio+',sincronizar="false",color="'+item.color+'",estado='+item.activo+' ,tieneimpuestos="'+item.tieneimpuestos+'" WHERE timespan="'+item.timespan+'"',[],function(tx,results){
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
		$("#txtSincro").html("30%");
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
		$("#txtSincro").html("45%");
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
		$("#txtSincro").html("60%");
		if($('#JSONEmpresaNube').html().length>0){
			var jsonpresup=JSON.parse($('#JSONEmpresaNube').html());
			console.log(jsonpresup);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
				for(var n=0;n<jsonpresup.length;n++){
					var item=jsonpresup[n];
					localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+'1,');
					localStorage.setItem('idioma',item.idioma);
					localStorage.setItem('propina',item.propina);

						
					/*tx.executeSql('UPDATE CONFIG SET nombre="'+item.nombreempresa+'",razon = "'+item.razon+'" , ruc="'+item.ruc+'",telefono ="'+item.telefono+'",direccion="'+item.direccion+'",serie="'+item.serie+'",establecimiento="'+item.establecimiento+'",nombreterminal="'+item.nombreterminal+'" WHERE id=1',[],function(tx,results){*/
					localStorage.setItem('sin_documento',item.documento);
					localStorage.setItem("con_shop",item.shop);
					localStorage.setItem("con_nombre_orden",item.orden);
					localStorage.setItem("con_tarjeta",item.tarjeta);
					localStorage.setItem("con_notas",item.notas);
					localStorage.setItem("con_comandas",item.comanderas);
					localStorage.setItem("con_mesas",true);
					localStorage.setItem("con_localhost",item.localhost);
                    localStorage.setItem("ip_servidor",item.ipservidor);

					tx.executeSql('UPDATE CONFIG SET nombre="'+item.nombreempresa+'",razon = "'+item.razon+'" , ruc="'+item.ruc+'",telefono ="'+item.telefono+'",direccion="'+item.direccion+'",serie="'+item.serie+'",establecimiento="'+item.establecimiento+'",nombreterminal="'+item.nombreterminal+'",pais="'+item.pais+'",id_idioma = "'+item.idioma+'",sin_documento="'+item.documento+'",con_nombre_orden="'+item.orden+'",con_propina="'+item.propina+'",con_tarjeta="'+item.tarjeta+'",con_shop="'+item.shop+'",con_notasorden="'+item.notas+'",con_comanderas="'+item.comanderas+'",con_localhost="'+item.localhost+'",ip_servidor="'+item.ipservidor+'" WHERE id=1',[],function(tx,results){
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
		$("#txtSincro").html("75%");
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
		$("#txtSincro").html("90%");
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
					$("#txtSincro").html("95%");
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
							$("#theProgress").css("width" , "95%");
							$("#finalizado").fadeIn();
							$("#contentStepSincro").css("display","none");
							$("#txtSincro").html("");
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
		$("#txtSincro").html("95%");
		
		if($('#JSONImpuestosNube').html()!=''){
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
			var jsonimp=JSON.parse($('#JSONImpuestosNube').html());
			var imp=jsonimp;
			console.log(imp);
			//$('#idiva').html('0');
			for(var t in imp){
				var itemi=imp[t];
				
					tx.executeSql('INSERT OR IGNORE INTO IMPUESTOS (nombre,porcentaje,activo,timespan) values (?,?,?,?)',[itemi.nombre,itemi.porcentaje,itemi.activo,itemi.id],function(tx,results){
						console.log("Insertado impuesto: "+results.insertId);
						if($.trim(itemi.nombre.toLowerCase())=='iva')
							$('#idiva').html(itemi.id);
						
						if($('#impuesto-'+itemi.id).length==0){
							$('#taxes').append('<input id="impuesto-'+itemi.id+'" type="text" value="'+itemi.id+"|"+itemi.nombre+"|"+parseFloat((itemi.porcentaje)/100)+'">');
						}else{
							$("impuesto-"+itemi.id).val(itemi.id+"|"+itemi.nombre+"|"+parseFloat((itemi.porcentaje)/100));
						}
					});
					
					tx.executeSql('UPDATE IMPUESTOS SET nombre=?,porcentaje=?,activo=? WHERE timespan = ?',[itemi.nombre,itemi.porcentaje,itemi.activo,itemi.id],function(tx,results){
						console.log("Actualizado impuesto: "+itemi.nombre);
						if($('#impuesto-'+itemi.id).length==0){
							$('#taxes').append('<input id="impuesto-'+itemi.id+'" type="text" value="'+itemi.id+"|"+itemi.nombre+"|"+parseFloat((itemi.porcentaje)/100)+'">');
						}else{
							$("impuesto-"+itemi.id).val(itemi.id+"|"+itemi.nombre+"|"+parseFloat((itemi.porcentaje)/100));
						}
					});		
			}
			},errorCB,successCB);
		}
		
		//modifica propinas
		if($('#JSONPropinasNube').html()!=''){
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
			var jsonprop=JSON.parse($('#JSONPropinasNube').html());
			var prop=jsonprop;
			console.log(prop);
			//$('#idiva').html('0');
			for(var t in prop){
				var itemi=prop[t];
				
					tx.executeSql('INSERT OR IGNORE INTO PROPINAS (valor,es_porcentaje,activo,timespan) values (?,?,?,?)',[itemi.valor,itemi.porcentaje,itemi.activo,itemi.id],function(tx,results){
						console.log("Insertada Propina rec: "+results.insertId);
					});
					
					tx.executeSql('UPDATE PROPINAS SET valor=?,es_porcentaje=?,activo=? WHERE timespan = ?',[itemi.valor,itemi.porcentaje,itemi.activo,itemi.id],function(tx,results){
						console.log("Actualizada propina: "+itemi.valor);
					});		
			}
			},errorCB,successCB);
		}
		//
		
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
					
					tx.executeSql('INSERT OR IGNORE INTO PERMISOS(clave,historial,configuracion,anular,impcierre,productos,activo,vertotales,irnube)VALUES("'+item.clave+'","'+item.historial+'","'+item.configuracion+'","'+item.anular+'","'+item.imprimircierre+'","'+item.productos+'","'+item.activo+'","'+item.vertotales+'","'+item.irnube+'")',[],function(tx,results){
						console.log("insertado permiso :"+results.insertId);
					});
					
					tx.executeSql('UPDATE PERMISOS SET clave="'+item.clave+'" , historial = "'+item.historial+'", configuracion = "'+item.configuracion+'" ,anular="'+item.anular+'",impcierre="'+item.imprimircierre+'",productos="'+item.productos+'",activo="'+item.activo+'",vertotales="'+item.vertotales+'",irnube="'+item.irnube+'" WHERE clave like "'+item.clave+'"',[],function(tx,results){
							console.log("actualizado permiso.");
					});
				}
				},errorCB,function(){
					$("#theProgress").css("width" , "98%");
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
						updateOnlineStatus('ONLINE');
						DatosRecurrentes(9);
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){$("#theProgress").css("width" , "0%"); SincronizadorNormal()},180000);
					});
				});
		}
	}else if(cual==9){
		console.log("recurrentes 9: Tipos de Mesas");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("98%");
		if($('#JSONTipoMesasNube').html().length>0){
			var jsontiposmesas=JSON.parse($('#JSONTipoMesasNube').html());
			console.log(jsontiposmesas);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
					for(var n=0;n<jsontiposmesas.length;n++){
						var item=jsontiposmesas[n];
						localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
						
						tx.executeSql('INSERT INTO TIPO_MESA(imagen_activa,imagen_inactiva,es_mesa,timespan) SELECT "'+item.imagen_activa+'","'+item.imagen_inactiva+'","'+item.es_mesa+'","'+item.id+'" WHERE NOT EXISTS(SELECT 1 FROM TIPO_MESA WHERE timespan like "'+item.id+'")',[],function(tx,results){
								console.log("insertado tipo de mesa:"+results.insertId);
						});
						
						tx.executeSql('UPDATE TIPO_MESA SET imagen_activa=?,imagen_inactiva=?,es_mesa=? WHERE timespan=?',[item.imagen_activa,item.imagen_inactiva,item.es_mesa,item.id],function(tx,results){
							console.log("actualizado tipo mesa");
						});
					}
				},errorCB,function(){
					$("#txtSincro").html("98%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('tipomesa')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						setTimeout(function(){
							$("#theProgress").css("width" , "98%");
						},1500);
						updateOnlineStatus('ONLINE');
						DatosRecurrentes(10);
					}).fail(function(){
						updateOnlineStatus("OFFLINE");
						setTimeout(function(){SincronizadorNormal()},180000);
					});
				});
		}
	}
	else if(cual==10){
		console.log("recurrentes 10: Mesas");
		$("#contentStepSincro").fadeIn();
		$("#txtSincro").html("98%");
		if($('#JSONMesasNube').html().length>0){
			var jsonmesas=JSON.parse($('#JSONMesasNube').html());
			console.log(jsonmesas);
			localStorage.setItem('dataupdate','');
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
				db.transaction(function(tx){
					for(var n=0;n<jsonmesas.length;n++){
						var item=jsonmesas[n];
						localStorage.setItem('dataupdate',localStorage.getItem("dataupdate")+item.id+',');
						
						tx.executeSql('INSERT INTO MESAS(left,top,id_tipomesa,activo,nombre,timespan,tab) SELECT '+item.left+','+item.top+',"'+item.tipo_mesa+'","'+item.activo+'","'+item.nombre+'","'+item.id+'","'+item.tab+'" WHERE NOT EXISTS(SELECT 1 FROM MESAS WHERE timespan like "'+item.id+'")',[],function(tx,results){
								console.log("insertada mesa:"+results.insertId);
						});
						
						tx.executeSql('UPDATE MESAS SET left=?,top=?,id_tipomesa=?,activo=?,nombre=?,tab=? WHERE timespan=?',[item.left,item.top,item.tipo_mesa,item.activo,item.nombre,item.tab,item.id],function(tx,results){
							console.log("actualizada mesa.");
						});
					}
				},errorCB,function(){
					$("#txtSincro").html("100%");
					$.post(apiURL,{
							id_emp: localStorage.getItem("empresa"),
							action: 'DeleteSinc',
							id_barra: localStorage.getItem("idbarra"),
							tabla: "('disenomesas')",
							idreal:localStorage.getItem("dataupdate"),
							deviceid:$("#deviceid").html()
					}).done(function(response){
						console.log(response);
						localStorage.setItem("dataupdate","");
						SubirDatosaNube(0);
						setTimeout(function(){
							$("#theProgress").css("width" , "100%");
						},1500);
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
		jsonc='{"nombreempresa":"'+item.nombre+'","razon":"'+item.razon+'","telefono":"'+item.telefono+'","ruc":"'+item.ruc+'","direccion":"'+item.direccion+'","email":"'+item.email+'","serie":"'+item.serie+'","establecimiento":"'+item.establecimiento+'","nombreterminal":"'+item.nombreterminal+'","idioma":"'+item.id_idioma+'","documento":"'+item.sin_documento+'","orden":"'+item.con_nombre_orden+'","propina":"'+item.con_propina+'","tarjeta":"'+item.con_tarjeta+'","shop":"'+item.con_shop+'"}';

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