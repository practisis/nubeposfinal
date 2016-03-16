var pagonormal=true;
function receiveJson(){
	if($('#json').html() != ''){
		var fetchJsonStrng = $('#json').html();
		var jsonObject = eval("(" + fetchJsonStrng + ")");
		$('#payClientName').html(jsonObject.Pagar[0].cliente.nombre);
		$('#payClientIDCard').html(jsonObject.Pagar[0].cliente.cedula);
		//$('#invoiceTotal').html(parseFloat(jsonObject.Pagar[0].factura.total).toFixed(2));
		$('#invoiceTotal').html(parseFloat(jsonObject.Pagar[0].factura.total).toFixed(2));
		$('#cardValue').val(jsonObject.Pagar[0].factura.total);
		$('#chequeValue').val(jsonObject.Pagar[0].factura.total);
		$('#valueCxX').val(jsonObject.Pagar[0].factura.total);
		$('#printTotal').html(jsonObject.Pagar[0].factura.total);
		}
}

//changePaymentCategory(0);
	
function changePaymentCategory(index,nombre){
	
	if(pagonormal==true){
		$('.paymentMethods').each(function(){
			if($(this).attr('idpaymentmethod')!=index){
				$(this).val('0.00');
				if(index==3)$('#valorcxc').val('0.00');
				if(index==4)$('#valorcheque1').val('0.00');
				
				//$('#simple_'+index).html('0.00');
			}

		});
	}
		
	
	$('.paymentMethods').each(function(){
		if($(this).attr('idPaymentMethod')==index){
			$(this).click();
		}
	});

	var value = 0;
	$('.paymentMethods').each(function(){
		if($(this).val() != 0 && $(this).val() != '' && $(this).val() != null){
			value += parseFloat($(this).val());
			}
	});
	updateForm(value);
}

$('.resetPayment').click(function(){
	sumOfButtonClicked = 0;
	var newValue = 0;
	$('#paymentEfectivo').val('');
	$('.paymentMethods').change();
});
	
	
$('.intPayment').click(function(){
	var calculateCeil = Math.ceil(parseFloat($('#invoiceTotal').html()));
	$('#paymentEfectivo').val(calculateCeil);
	$('.paymentMethods').change();
	});
	
$('.exactPayment').click(function(){
	var calculate = (parseFloat($('#invoiceTotal').html()));
	$('#paymentEfectivo').val(calculate);
	$('.paymentMethods').change();

});

$('.paymentMethods').change(function(){
	var value = 0;
	$('.paymentMethods').each(function(){
		if($(this).val() != 0 && $(this).val() != '' && $(this).val() != null){
			value += parseFloat($(this).val());
			}
		});
	updateForm(value);
});
	
var sumOfButtonClicked = 0;
$('.buttonsPayment').click(function(){
	var dataValue = $(this).attr('data-value');
	var valueFromButtonClicked = $.trim(parseFloat(dataValue));
	sumOfButtonClicked += parseFloat(valueFromButtonClicked);
	//$('#paymentEfectivo').val(parseFloat(sumOfButtonClicked).toFixed(2));
	
	var value = 0;
	$('.paymentMethods').each(function(){
		if($(this).val() != 0 && $(this).val() != '' && $(this).val() != null){
			value += parseFloat($(this).val());
			}
		});
	updateForm(value);
});
	
function updateForm(value){
	value = parseFloat(value);
	var total = parseFloat($('#total').html().substring(1));
	var change = (value - total);
	//alert(value+'/'+total+'/'+change);
	if(value < total){
		$('#invoiceDebt').html('FALTANTE');
		change = Math.abs(change);
		$('#invoicePaid').html(value.toFixed(2));
		$('#cardValue').val(change.toFixed(2));
		$('#chequeValue').val(change.toFixed(2));
		$('#valueCxX').val(change.toFixed(2));
	}
	else if(value > total){
		$('#invoiceDebt').html('VUELTO');
		change = Math.abs(change);
		$('#invoicePaid').html(value.toFixed(2));
		$('#cardValue').val(0);
		$('#chequeValue').val(0);
	}
	else if(value == total){
			$('#invoiceDebt').html('VUELTO');
			change = Math.abs(change);
			$('#invoicePaid').html(value.toFixed(2));
			$('#cardValue').val(0);
			$('#chequeValue').val(0);
	}
	    
	$('#changeFromPurchase').html(change.toFixed(2));
}
	

function performPurchase(restaurant){
	//$('#printFactura').show();
	$('#btn_descuento').html('DESC');
	pagar();
	if($('#idCliente').val()!=''&&$('#idCliente').val()>0){
		if(parseFloat($('#invoicePaid').html())>0){
		var table;
		var aux=$('#invoiceNr').val();
		var acc = 0;
		var echo = document.getElementById('echo').value;
		var invoicePaid = parseFloat($('#invoicePaid').html());
		var invoiceTotal = parseFloat($('#invoiceTotal').html());
		
		if(invoicePaid < invoiceTotal){
			showalertred('El valor pagado es menor del total');
            //$('#printFactura').hide();
			return false;
		}
			
		$('#payButton').hide();
		$('#payButtonActivated').show();
		
		//figure out what payments types were used and store them into an array
		var paymentsUsed = new Array();
		$('.paymentMethods').each(function(){
			if($(this).val() != '' && $(this).val() != 0 && $(this).val() != null){
				var paymentMethod = $(this).attr('paymentMethod');
				var idPaymentMethod = $(this).attr('idPaymentMethod')
				var combineToString = paymentMethod +'|'+ idPaymentMethod;
				paymentsUsed.push(idPaymentMethod);
				}
			});
		
		var fetchJson = $('#json').html();
		var figureOutLength = paymentsUsed.length;
		var cash = 0;
		var valueCxC = 0;
		var credit = 0;
		var newCredit = 0;
		var justificationCxC = '';
		var creditJustification = '';
		var giftValue = 0;
		var	giftJustification = '';
		var paymentConsumoInterno = 0;
		var internalJustification = '';
		var cards = new Array();
		var cheques = new Array();
		
		$.each(paymentsUsed, function(index,value){
			if(value == 1){
				cash = parseFloat($('#paymentEfectivo').val());
				}
		
			if(value == 2){
				//$('.cardRow').each(function(){
					var fetchCardID = parseInt($('#card-'+ $(this).attr('id')).attr('cardID'));
					var cardLote = parseFloat($('#lote-'+ $(this).attr('id')).html());
					//var cardValue = parseFloat($('#cardvalue-'+ $(this).attr('id')).html());
					var cardValue = parseFloat($('#paymentTarjetas').val());
					//var combineCardInfo = fetchCardID +'|'+ cardLote +'|'+ cardValue +'@';
					var combineCardInfo = '0|0|'+cardValue+'@';
					cards.push(combineCardInfo);
					//});
			}
				
			if(value == 3){
				//$('.chequeRow').each(function(){
					var fetchBankID = parseInt($('#bank-'+ $(this).attr('id')).attr('bankID'));
					var chequeNumber = parseFloat($('#number-'+ $(this).attr('id')).html());
					//var chequeValue = parseFloat($('#chequevalue-'+ $(this).attr('id')).html());
					var chequeValue = parseFloat($('#paymentCheques').val());
					//var combineChequeInfo = fetchBankID +'|'+ chequeNumber +'|'+ chequeValue +'@';
					var combineChequeInfo = '0|0|'+ chequeValue +'@';
					cheques.push(combineChequeInfo);
					//});
				}
				
			if(value == 4){
				valueCxC = $('#paymentCxC').val();
				justificationCxC = $('#justcxc').val();
			}
			
			if(value == 5){
				retencion = $('#paymentRetencion').val();
			}
				
			if(value == 6){
				credit = $('#paymentPrepago').val();
			}
				
			if(value == 7){
				newCredit = $('#paymentNotadeCredito').val();
				creditJustification = $('#creditJustification').val();
				}
				
			if(value == 9){
				giftValue = $('#paymentCortesia').val();
				giftJustification = $('#giftJustification').val();
				}
				
			if(value == 12){
				paymentConsumoInterno = $('#paymentConsumoInterno').val();
				internalJustification = $('#internalJustification').val();
				}
			
			});
			
			var clientName = $.trim($('#payClientName').html());
			var RUC = $.trim($('#cedulaP').val());
			var address = $('#direccionP').val();
			var tele = $('#telefonoP').val();
			
			//console.log(clientName+'/'+RUC);
			//console.log(clientName+'/'+RUC);
			/*funcion para insertar datos de las facturas*/
			var hoy=new Date().getTime();
			//console.log(hoy);
			
			var mitimespan=$('#timespanFactura').val();
			
			echo=parseFloat(invoicePaid-invoiceTotal);
			
			/*VALORES PARA LA FACTURA*/
			var mitotal=$('#total').html().substring(1);
			var subconiva=$('#subtotalIva').val();
			var subsiniva=$('#subtotalSinIva').val();
			var eliva=0;
			if($('#impuestoFactura-1').val()!=''&&$('#impuestoFactura-1').length) eliva=$('#impuestoFactura-1').val();
			var factc=$('#invoiceNrComplete').val();
			//alert(eliva);
			var servicio=0;
			if($('#impuestoFactura-2').length&&$('#impuestoFactura-2').val()!='') servicio=$('#impuestoFactura-2').val();
			
			var descuento=$('#descuentoFactura').val();
			
			/*cadenaimpuestos*/
			var c=0;
			var dataimpuestos='';
			$('.esImpuesto').each(function(){
				var getName = $(this).data('nombre');
				var getId = $(this).data('id');
				var getValue = $(this).data('valor');
				
				if(c>0){
					dataimpuestos+="@";
				}	
				dataimpuestos+=getId+"|"+getName+"|"+getValue+"|"+$(this).val();
				c++;
			});
			
			
			/*FIN VALORES PARA LA FACTURA*/
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(Ingresafacturas, errorCB, successCB);
			function Ingresafacturas(tx){
				var now=new Date().getTime();
				tx.executeSql("INSERT INTO logactions (time,descripcion,datos) values (?,?,?)",[now,"Inserta Factura",fetchJson],function(tx,results){});
				
				tx.executeSql("INSERT INTO FACTURAS(clientName,RUC,address,tele,fetchJson,paymentsUsed,cash,cards,cheques,vauleCxC,paymentConsumoInterno,tablita,aux,acc,echo,fecha,timespan,sincronizar,total,subconiva,subsiniva,iva,servicio,descuento,nofact,dataimpuestos)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[clientName,RUC,address,tele,fetchJson,paymentsUsed,cash,cards,cheques,valueCxC,paymentConsumoInterno,table,aux,acc,echo,hoy,mitimespan,'true',mitotal,subconiva,subsiniva,eliva,servicio,descuento,factc,dataimpuestos],function(){
					console.log("Nueva Factura Ingresada");
					var mijsonprod=JSON.parse(fetchJson);
					var misprod = mijsonprod.Pagar[0].producto;
						for(var j in misprod){
							var item = misprod[j];
							IngresaDetalles(item,mitimespan);
						}

					//$('#pay').fadeOut('fast');
					// envia('nubepos/nubepos/');
				});
			}
			
		function IngresaDetalles(item,mifactura){
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
            db.transaction(function (tx2){
				var string_impuestos=item.impuesto_prod;
				var miprecio=parseFloat(item.precio_orig);
				var preciomas=0;
				/*var listaimpuestos=string_impuestos.split('@');
				if(listaimpuestos.indexOf('1')>=0)
					preciomas+=miprecio*(0.12);
				if(listaimpuestos.indexOf('2')>=0)
					preciomas+=miprecio*(0.10);*/
				miprecio=miprecio+preciomas;
				
				var now=new Date().getTime();
				tx2.executeSql("INSERT INTO logactions (time,descripcion,datos) values (?,?,?)",[now,"Inserta Detalles Factura",JSON.stringify(item)+" ,Factura:"+mifactura],function(tx,results){});
				
				tx2.executeSql("INSERT INTO FACTURAS_FORMULADOS(timespan_factura,timespan_formulado,cantidad,precio_unitario)VALUES(?,?,?,?)",[mifactura,item.id_producto,item.cant_prod,miprecio],function(){
					console.log("Nuevo Detalle Factura Ingresado");
				});
			});
		}
			
			// $('#subtotalSinIva,#subtotalIva,#descuentoFactura,#totalmiFactura').val('0');
			
			
			$('#pay').hide();
			if(clientName == ''){
				clientName = 'Consumidor Final';
			}
			var nextnumFac = $('#nextnumber').val();
			$('#numFac').val(nextnumFac);
			$('#nomCli').val(clientName);
			$('#docCli').val(RUC);
			$('.paymentMethods').each(function(){
				if($(this).val() != '' && $(this).val() != 0 && $(this).val() != null){
					var formPayment = $(this).attr('paymentMethod');
					$('#printFormsPayments').append('<tr><td style="text-align:center;" id="pagoForm">\
														'+formPayment+'\
													</td></tr>');
				}
			});
			var datosProductos = JSON.parse(fetchJson.toString());
			var productos = datosProductos.Pagar[0].producto;
			for(var i in productos){
				var precioUnit = productos[i].precio_prod;
				precioUnit = parseFloat(precioUnit).toFixed(2)
				var precioTot = productos[i].precio_total;
				precioTot = parseFloat(precioTot).toFixed(2);
				$('#printProducts').append('<tr class="productosComprados"><td class="canti">'+productos[i].cant_prod+'</td><td class="descrip">'+productos[i].nombre_producto+'</td><td class="valUnit">'+precioUnit+'</td><td class="valTot">'+precioTot+'</td></tr>');
			}
			
			var datosFactura = JSON.parse(fetchJson);
			var subsinIVA = datosFactura.Pagar[0].factura.subtotal_sin_iva;
			subsinIVA = parseFloat(subsinIVA).toFixed(2);
			$('#subsiniva').html(subsinIVA);
			var subIVA = datosFactura.Pagar[0].factura.subtotal_iva;
			subIVA = parseFloat(subIVA).toFixed(2);
			$('#subconiva').html(subIVA);
			var impuestos = datosFactura.Pagar[0].factura.impuestos;
			var ivaImp = impuestos.split("/");
			var iva = parseFloat(ivaImp[1]).toFixed(2);
			$('#impuestos').html(iva);
			var descuentoFac = datosFactura.Pagar[0].factura.descuento;
			descuentoFac = parseFloat(descuentoFac).toFixed(2);
			$('#descFac').html(descuentoFac);
			var totalFac = datosFactura.Pagar[0].factura.total;
			totalFac = parseFloat(totalFac).toFixed(2);
			$('#totalPagado').html(totalFac);
			console.log(datosFactura.Pagar[0]);
            impresionMovil(fetchJson.toString());
            //setTimeout(function(){localStorage.setItem("nameorder","");},2000);
		}else{
			showalertred("El valor pagado es menor que el total.");
		}
	}else{
		alert("Por favor, elija un cliente.");
	}
}


function impresionMovil(mijson){
	envia('puntodeventa');
	$('.productosComprados').remove();
	$('#subsiniva').html('');
	$('#subconiva').html('');
	$('#impuestos').html('');
	$('#descFac').html('');
	$('#totalPagado').html('');
	$('#tablaCompra').html('');
	$('#printFactura').hide();
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(function (tx){
		
		var now=new Date().getTime();
		tx.executeSql("INSERT INTO logactions (time,descripcion,datos) values (?,?,?)",[now,"Envia a Imprimir Factura",mijson],function(tx,results){});
				
		tx.executeSql('SELECT printer FROM CONFIG where id=1',[],
		function(tx,res){
			if(res.rows.length>0){
				var miprint=res.rows.item(0);
				//alert(miprint.printer);
				StarIOAdapter.rawprint(mijson,miprint.printer, function() {
					var now=new Date().getTime();
					tx.executeSql("INSERT INTO logactions (time,descripcion,datos) values (?,?,?)",[now,"Se imprimió la Factura",""]);
					showalert("Imprimiendo Factura");
				});
			}else{
				showalert("No se ha configurado una impresora");
			}
		});
	},errorCB,successCB);
    localStorage.setItem("nameorder","");
}

function cancelPayment(){
	$('#payButton').show();
	$('#payButtonActivated').hide();
	//$('#referenceToReset')[0].reset();
	$('.paymentMethods').val('');
	$('#justification').val('');
	$('.passwordCheck').val('');
	$('.payOverview').html(0);
	$('.cardRow').remove();
	$('.chequeRow').remove();
	//changePaymentCategory(0);
	//$('#pay').hide();
	
	$('#printFactura').hide();
	$('#functionality-1').show();
	$('#paymentCategory-1').addClass('categoryChosen');
	$('#invoicePaid').html('0.00');
	$('#changeFromPurchase').html('0.00');
	//$('#paymentModule').modal('hide');
	$('#paymentModule').slideUp();
	ResetPagos(1);
	ResetPagos(2);
	ResetPagos(3);
	ResetPagos(4);
}

		  
function BuscarCliente(e){
	var valor=$('#cedulaP').val();
	$('#descripcionD input').each(function(){
		if($(this).attr('id')!='cedulaP')
			$(this).val('');
	});
	
	if(e==13){
		mostrarClientes();
		//$('#opaco').fadeIn();
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(
		function (tx){
			tx.executeSql('SELECT * FROM CLIENTES WHERE cedula=?;',[valor],
			function(tx,res){
				if(res.rows.length>0){
					console.log(res);
					var row=res.rows.item(0);
					entro=true;
					$('#idCliente').val(row.id);
					$('#clientID').val(row.id);
					$('#nombreP').val(row.nombre);
					$('#clientefind').html(row.nombre);
					$('#cedulaP').val(row.cedula);
					$('#telefonoP').val(row.telefono);
					$('#direccionP').val(row.direccion);
					$('#emailP').val(row.email);
					$('#payClientName').html(row.nombre);
					$('.tipoClienteP').val(1);
					if($('#insideShop').length > 0){
						continueShopping(row.id);
					}
			}});	
		},errorCB,successCB);
		
		$('#descripcionD input').each(function(){
			if(valor=='9999999999999'){
				if($(this).attr('id')!='cedulaP')
					$(this).prop('readonly','true');
			}else{
					$(this).removeProp('readonly');
			}
		});
	
	}
}

function CambiarMetodo(cual){
	//console.log('viene aqui');
	var nombre=$('#payment'+cual).attr('paymentMethod');
	var index=$('#payment'+cual).attr('idPaymentMethod');
	if(pagonormal==true) $('.touchpago').hide();
	
	if(pagonormal==true&&cual!='Tarjetas'){
		$('.cardv').html('');
		$('#valortarjeta').val('0.00');
		$('.card').attr('data-value','0');
		$('#simple_2').html('0.00');
	}
	
	//alert(pagonormal+"/"+cual);
	
	if(cual=='Efectivo'){
		if(pagonormal==true){
			$('#valorcxc,#paymentCxC,#valorcheque1,#paymentCheques').val("0.00");
			$('#simple_2,#simple_3,#simple_4').html('0.00');
			//$('#paymentEfectivo').val(parseFloat($('#total').html().substring(1)).toFixed(2));
			//$('#simple_1').html(parseFloat($('#total').html().substring(1)).toFixed(2));
			$('#touchefectivo').slideDown();
		}else{
			$('#paymentEfectivo').select();
			if($('#touchefectivo').css('display')=='none')
				$('.touchpago').hide();
			$('#touchefectivo').slideDown();
		}
		
	}
	if(cual=='Tarjetas'){
	
		if(pagonormal==true){
			//alert("entra tarjetas");
			$('#valorcxc,#paymentCxC,#valorcheque1,#paymentCheques').val("0.00");
			$('#simple_1,#simple_3,#simple_4').html('0.00');
			//$('.touchpago').hide();
			$('#touchtarjetas').slideDown();
		}else if($('#touchtarjetas').css('display')=='none'){
				$('.touchpago').hide();
			$('#touchtarjetas').slideDown();
		}
	}
	
	if(cual=='Cheques'){
		if(pagonormal==true){
			$('#simple_1,#simple_2,#simple_4').html('0.00');
			$('#valorcxc,#paymentCxC').val("0.00");
			$('#valorcheque1,#paymentCheques').val(parseFloat($('#total').html().substring(1)).toFixed(2));
			$('#simple_3').html(parseFloat($('#total').html().substring(1)).toFixed(2));
			$('#touchcheques').slideDown();
			//valorchequechange();
		}else{
			    $('.touchpago').hide();
				$('#touchcheques').slideDown();
				if(parseFloat($('#valorcheque1').val())==0||$('#valorcheque1').val()==""){
					if((parseFloat($('#invoicePaid').html())-parseFloat($('#invoiceTotal').html()))<0)
					$('#valorcheque1,#paymentCheques').val(parseFloat($('#changeFromPurchase').html()).toFixed(2));
					/*var falta=parseFloat($('#invoicePaid').html())-parseFloat($('#invoiceTotal').html());
					if(falta<0)
						$('#valorcheque1,#paymentCheques').val(parseFloat(falta*-1).toFixed(2));*/
				//valorchequechange();
			}
		}
		
	}
	if(cual=='CxC'){
		if(pagonormal==true){
			$('#valorcheque1,#paymentCheques').val("0.00");
			$('#simple_1,#simple_2,#simple_3').html('0.00');
			$('#valorcxc,#paymentCxC').val(parseFloat($('#total').html().substring(1)).toFixed(2));
			$('#simple_4').html(parseFloat($('#total').html().substring(1)).toFixed(2));
			$('#touchcxc').slideDown();
			//changePaymentCategory('4','Cheques');
			//valorcxcchange();
		}else{
				if($('#touchcxc').css('display')=='none')
					{$('.touchpago').hide();$('#touchcxc').slideDown();}
				if(parseFloat($('#valorcxc').val())==0){
				if((parseFloat($('#invoicePaid').html())-parseFloat($('#invoiceTotal').html()))<0)
					$('#valorcxc,#paymentCxC').val(parseFloat($('#changeFromPurchase').html()).toFixed(2));
				//valorcxcchange();
			}
		}
	}
	$('.columna1 div').each(function(){
		$(this).attr('class','paymentCategories');
		$(this).css('backgroundColor','');
	});
	
	
	$('#paymentCategory-'+ index).attr('class','categoryChosen');
	//alert($('#invoiceTotal').html());
	var faltante=parseFloat($('#total').html().substring(1));
	var pagado=0;
	$('.paymentMethods').each(function(){
		var partepago=0;
		if($(this).val()!=''){
			//if(nombre=='Efectivo')
				//$(this).val('0.00');
			partepago=parseFloat($(this).val());
		}
		faltante-=partepago;
		pagado+=partepago;
	});
	
	updateForm(pagado);
	
	//alert('falt'+faltante);
	if(faltante==0){
		//alert(faltante);
		$('#invoiceDebt').html('VUELTO');
		$('#changeFromPurchase').html('0.00');
	}else if(faltante<0){
		$('#invoiceDebt').html('VUELTO');
		$('#changeFromPurchase').html((-1*faltante).toFixed(2));
	}else{
		$('#invoiceDebt').html('FALTANTE');
		$('#changeFromPurchase').html(faltante.toFixed(2));
	}
}
	
function jsonNuevoCliente(){
	var apellidoP=$('#apellidoP').val();
	
	var nacionalidad=1;//$('#nacionalidad').val();
	var cedula=$('#cedulaP').val();
	var nombreP=$('#nombreP').val();
	var tipoP=$('#tipoP').val();
	var direccionP=$('#direccionP').val();
	var telefonoP=$('#telefonoP').val();
	var email=$('#descripcionD #emailP').val();
	var sexoP=$('#sexoP').val();
	var fecha=$('#fecha').val();
	var notasP=$('#notasP').val();
	$("#cedula").val( cedula );
	$("#nombre").val( nombreP + " " + apellidoP );
	$("#telefono").val( telefonoP );
	$(".direccion").html( direccionP );
	$("#tipoCliente").html( tipoP );

	
	
	// alert("Ana"+nombreP+'-'+cedula);
	
	if( !nombreP) return; if( !cedula) return;
	//console.log(email);
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(
	function (tx){
		tx.executeSql('SELECT id FROM CLIENTES WHERE cedula=?;',[cedula],
		function(tx,res){
			if(res.rows.length>0){
				tx.executeSql('UPDATE CLIENTES SET nombre=?,direccion=?, telefono=?, email=?, sincronizar=? WHERE cedula=?;',[nombreP,direccionP,telefonoP,email,cedula,'true'],
				function(tx,res2){
					console.log("Cliente Actualizado!");
					$('#idCliente').val(res.rows.item(0).id);
					$("#clientefind").html(nombreP);
					$("#busquedacliente").html(cedula);
					$("#newCliente,#opaco").fadeOut();
				});	
			}else{
				tx.executeSql('INSERT INTO CLIENTES (nombre,direccion,cedula,telefono,email,existe,sincronizar) VALUES (?,?,?,?,?,?,?)',[nombreP,direccionP,cedula,telefonoP,email,0,'true'],
				function(tx,res3){
					console.log(res3.insertId);
					$('#idCliente').val(res3.insertId);
					$("#clientefind").html(nombreP);
					$("#busquedacliente").html(cedula);
					$("#newCliente,#opaco").fadeOut();
				});	
			}
			
		});				
	},errorCB,successCB);
}

function noCliente(){
	if($('#cedulaP').val()==''){
		$('#cedulaP').val('9999999999999');
		BuscarCliente(13);
	}
	$("#cuadroClientes,#opaco").fadeOut("fast",function(){});
}

 
  function mostrarClientes(){
	  
	  console.log("tiene documento:"+localStorage.getItem("sin_documento"));
	  
		if($("#newCliente").html()!=''){
			$("#opaco,#cuadroClientes,#newCliente").fadeIn();
		}else{
			if(localStorage.getItem("sin_documento")==true){
				//codigo sin documento
				$("#newCliente ").html('\
			<div style="position:relative; left:0%; width:100%; height:100%" id="borrable">\
				<div id="cuadroClientes" class="cuadroClientes" style="height:100%;"> \
					<h3>Cliente</h3><div style="width:100%; text-align:right; padding-right:5px;  padding-right:5px; cursor:pointer;color:#1495C0; position:absolute; top:3px; right:12px; cursor:pointer;"><i onclick="noCliente();" class="fa fa-chevron-circle-left fa-3x" title="Volver..."></i></div>\
					<table id="descripcionD" class="table table-striped">\
						<tr> \
							<td colspan=2>\
								<br><br>\
								<input type="hidden" tabIndex="1" id="cedulaP" value="0000000000" onkeypress="isalphanumeric(event);" class="form-control"/> \
									<table tabIndex="99"  cellpadding="0"  cellspacing="0" width="70%" style="position: relative;margin: 0px auto;">\
										<tr>\
											<td>\
												<div class="input-group" style="width:100%;margin-bottom:10px;"><span class="input-group-addon" style="width:30%">&nbsp;Nombre*</span>\
													<input  tabIndex="2" onkeyup="validacliente()" id="nombreP" class="form-control" onkeypress="isalphanumeric(event);"  value="Consumidor Final"/></div>\
											</td>\
										</tr>\
										\
										<tr>\
												<td>\
											     <div class="input-group" style="width:100%;margin-bottom:10px;"><span class="input-group-addon"  style="width:30%">&nbsp;Teléfono</span>\<input tabindex="3" onkeypress="isalphanumeric(event);" id="telefonoP"class="form-control" type="number"/></div>				</td>\
										</tr>\
										<tr>\
												<td>\
												 <div class="input-group" style="width:100%;margin-bottom:10px;">									<span class="input-group-addon"  style="width:30%">&nbsp;Dirección</span>\
													<input tabIndex="3" onkeypress="isalphanumeric(event);" id="direccionP" class="form-control"/></div> \
												</td>\
										</tr>\
										<tr>\
												<td>\<div class="input-group" style="width:100%;margin-bottom:10px;">														<span class="input-group-addon"  style="width:30%">&nbsp;Email</span>\
													\
													<input tabIndex="4" id="emailP" class="form-control"/></div>\
												</td>\
										</tr>\
										\
									</table>\
									\
									<br>\
							</td>\
						</tr>\
						<tr>\
							<td colspan=2>\
								<br>\
								<div>\
									<table style="cursor:pointer;position: relative; margin: 0px auto;" cellspacing="5px">\
										<tr>\
											<td style="vertical-align:top;">\
												<button onclick="noCliente();" tabindex="8" class="btn btn-default">Cancelar</button> \
											</td>\
											<td style="vertical-align: top;">\
												<button tabindex="7" class="btn btn-success" onclick="jsonNuevoCliente()">Guardar</button> \
											</td>\
										</tr>\
									</table>\
								</div>\
							</td>\
						</tr>\
					</table>\
				</div>\
			<input type="hidden" id="idCliente" value="1"/></div>\
			<style>\
				#descripcionD tr td table tr td{\
					text-align:left;font-size:13px;height:25px;\
				}\
			</style>');
			}else{
				//codigo con documento
			$("#newCliente ").html('\
			<div style="position:relative; left:0%; width:100%; height:100%" id="borrable">\
				<div id="cuadroClientes" class="cuadroClientes" style="height:100%;"> \
					<h3>Cliente</h3><div style="width:100%; text-align:right; padding-right:5px;  padding-right:5px; cursor:pointer;color:#1495C0; position:absolute; top:3px; right:12px; cursor:pointer;"><i onclick="noCliente();" class="fa fa-chevron-circle-left fa-3x" title="Volver..."></i></div>\
					<table id="descripcionD" class="table table-striped">\
						<tr> \
							<td colspan=2>\
								<br><br>\
									<table tabIndex="99"  cellpadding="0" cellspacing="0" width="70%" style="position: relative;margin: 0px auto;">\
										<tr>\
											<td>\
										<div class="input-group" style="width:100%; margin-bottom:10px;"><span class="input-group-addon" style="width:30%">\
													&nbsp;Cédula* \
											</span><input tabIndex="1" id="cedulaP" value="9999999999999" onkeypress="isalphanumeric(event);" class="form-control"/> </div>\
												</td>\
										</tr>\
										<tr>\
											<td>\
												<div class="input-group" style="width:100%;margin-bottom:10px;"><span class="input-group-addon" style="width:30%">&nbsp;Nombre*</span>\
													<input  tabIndex="2" id="nombreP" class="form-control" onkeypress="isalphanumeric(event);"  value="Consumidor Final"/></div>\
											</td>\
										</tr>\
										\
										<tr>\
												<td>\
											     <div class="input-group" style="width:100%;margin-bottom:10px;"><span class="input-group-addon"  style="width:30%">&nbsp;Teléfono</span>\<input tabindex="3" onkeypress="isalphanumeric(event);" id="telefonoP"class="form-control" type="number"/></div>				</td>\
										</tr>\
										<tr>\
												<td>\
												 <div class="input-group" style="width:100%;margin-bottom:10px;">									<span class="input-group-addon"  style="width:30%">&nbsp;Dirección</span>\
													<input tabIndex="3" onkeypress="isalphanumeric(event);" id="direccionP" class="form-control"/></div> \
												</td>\
										</tr>\
										<tr>\
												<td>\<div class="input-group" style="width:100%;margin-bottom:10px;">														<span class="input-group-addon"  style="width:30%">&nbsp;Email</span>\
													\
													<input tabIndex="4" id="emailP" class="form-control"/></div>\
												</td>\
										</tr>\
										\
									</table>\
									\
									<br>\
							</td>\
						</tr>\
						<tr>\
							<td colspan=2>\
								<br>\
								<div>\
									<table style="cursor:pointer;position: relative; margin: 0px auto;" cellspacing="5px">\
										<tr>\
											<td style="vertical-align:top;">\
												<button onclick="noCliente();" tabindex="8" class="btn btn-default">Cancelar</button> \
											</td>\
											<td style="vertical-align: top;">\
												<button tabindex="7" class="btn btn-success" onclick="jsonNuevoCliente()">Guardar</button> \
											</td>\
										</tr>\
									</table>\
								</div>\
							</td>\
						</tr>\
					</table>\
				</div>\
			<input type="hidden" id="idCliente" value="1"/></div>\
			<style>\
				#descripcionD tr td table tr td{\
					text-align:left;font-size:13px;height:25px;\
				}\
			</style>');
			$('.direccion').html( " " );
			$('.tipoCliente').html( "Tipo de cliente:  "  );
				$('#cedulaP').val('9999999999999');
				$('#idCliente').val('1');
			$('#clientID').val('1');
			$('#cedulaP').attr({ maxLength : 13 });
			$('#nombre').val('Consumidor Final');
			$('#cedulaP').click(function(){
				$(this).select();
			});
		$('#cedulaP').change(function(){
		if(cedula()){
				if($('#nombreP').length==0){
					$('#busquedacliente').val('9999999999999');
					$('#clientefind').html("Consumidor Final");
					BuscarCliente(13);
				}
		}else{
			showalert("La cédula ingresada no es correcta.");
			$('#cedulaP').val('');
			$('#cedulaP').focus();
		}
		});	
		
	$('#cedulaP').keyup(function(event){
		$('#clientefind').html('');
		$('#idCliente').val('0');
		var idcli=$(this).val();
		if(idcli.length==10){
			$('#busquedacliente').val(idcli);
			$('#clientefind').html('');
			$('#cedulaP').css('background-color', 'white');
			$('#cedulaP').effect("highlight");
			BuscarCliente(13);
		}else if($(this).val().length==13){
			$('#busquedacliente').val(idcli);
			$('#cedulaP').css('background-color', 'white');
			$('#cedulaP').effect("highlight");
			$('#clientefind').html('');
			BuscarCliente(13);
		}else if(idcli.length==0){
			$('#busquedacliente').val('9999999999999');
			$('#clientefind').val('Consumidor Final');
			BuscarCliente(13);
		}else{
			/*$('#cuadroClientes input').each(function(){
				if($(this).attr('id')!='cedulaP')
					$(this).val('')
				}
			);*/
		}
	});
	}
	//}
}
}

function cedula() {
	numero = document.getElementById("cedulaP").value;
	if(numero=='9999999999999')
		return true;
	if(numero.indexOf("p")>=0||numero.indexOf("P")>=0)
		return true;

	var suma = 0;
	var residuo = 0;
	var pri = false;
	var pub = false;
	var nat = false;
	var numeroProvincias = 24;
	var modulo = 11;

	/* Verifico que el campo no contenga letras */
	var ok=1;
	/* Aqui almacenamos los digitos de la cedula en variables. */
	d1 = numero.substr(0,1);
	d2 = numero.substr(1,1);
	d3 = numero.substr(2,1);
	d4 = numero.substr(3,1);
	d5 = numero.substr(4,1);
	d6 = numero.substr(5,1);
	d7 = numero.substr(6,1);
	d8 = numero.substr(7,1);
	d9 = numero.substr(8,1);
	d10 = numero.substr(9,1);

	/* El tercer digito es: */
	/* 9 para sociedades privadas y extranjeros */
	/* 6 para sociedades publicas */
	/* menor que 6 (0,1,2,3,4,5) para personas naturales */

	if (d3==7 || d3==8){
	console.log('El tercer d?gito ingresado es inv?lido');
	return false;
	}

	/* Solo para personas naturales (modulo 10) */
	if (d3 < 6){
	nat = true;
	p1 = d1 * 2; if (p1 >= 10) p1 -= 9;
	p2 = d2 * 1; if (p2 >= 10) p2 -= 9;
	p3 = d3 * 2; if (p3 >= 10) p3 -= 9;
	p4 = d4 * 1; if (p4 >= 10) p4 -= 9;
	p5 = d5 * 2; if (p5 >= 10) p5 -= 9;
	p6 = d6 * 1; if (p6 >= 10) p6 -= 9;
	p7 = d7 * 2; if (p7 >= 10) p7 -= 9;
	p8 = d8 * 1; if (p8 >= 10) p8 -= 9;
	p9 = d9 * 2; if (p9 >= 10) p9 -= 9;
	modulo = 10;
	}

	/* Solo para sociedades publicas (modulo 11) */
	/* Aqui el digito verficador esta en la posicion 9, en las otras 2 en la pos. 10 */
	else if(d3 == 6){
	pub = true;
	p1 = d1 * 3;
	p2 = d2 * 2;
	p3 = d3 * 7;
	p4 = d4 * 6;
	p5 = d5 * 5;
	p6 = d6 * 4;
	p7 = d7 * 3;
	p8 = d8 * 2;
	p9 = 0;
	}

	/* Solo para entidades privadas (modulo 11) */
	else if(d3 == 9) {
	pri = true;
	p1 = d1 * 4;
	p2 = d2 * 3;
	p3 = d3 * 2;
	p4 = d4 * 7;
	p5 = d5 * 6;
	p6 = d6 * 5;
	p7 = d7 * 4;
	p8 = d8 * 3;
	p9 = d9 * 2;
	}

	suma = p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
	residuo = suma % modulo;

	/* Si residuo=0, dig.ver.=0, caso contrario 10 - residuo*/
	digitoVerificador = residuo==0 ? 0: modulo - residuo;

	/* ahora comparamos el elemento de la posicion 10 con el dig. ver.*/
	if (pub==true){
	if (digitoVerificador != d9){
	console.log('El ruc de la empresa del sector público es incorrecto.');
	return false;
	}
	/* El ruc de las empresas del sector publico terminan con 0001*/
	if ( numero.substr(9,4) != '0001' ){
	console.log('El ruc de la empresa del sector público debe terminar con 0001');
	return false;
	}
	}
	else if(pri == true){
	if (digitoVerificador != d10){
	console.log('El ruc de la empresa del sector privado es incorrecto.');
	return false;
	}
	if ( numero.substr(10,3) != '001' ){
	console.log('El ruc de la empresa del sector privado debe terminar con 001');
	return false;
	}
	}

	else if(nat == true){
	if (digitoVerificador != d10){
	console.log('El n?mero de cédula de la persona natural es incorrecto.');
	return false;
	}
	if (numero.length >10 && numero.substr(10,3) != '001' ){
	console.log('El ruc de la persona natural debe terminar con 001');
	return false;
	}
	}
	return true;
}