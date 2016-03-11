var currentCantidad=0;
var currentAction='';
var altolistaprod=0;
var pantAlto=$('#content').height();
var pantAncho=$('#content').width();
var vertical=false;
var misdenominaciones=[0.01,0.05,0.10,0.25,0.50,1,5,10,20,100]; 
var cobronormal=true;


function ActivarCategoria(cual,categoria){
	console.log(categoria);
	$('#category').val(categoria);
	$('#controller').val(1);
	$('.directionProducts').css('display','none');
	$('#listaProductos').html('');
	$('#pager').val('1');
	var fila=cual.parentNode.parentNode;
	var miscateg=fila.getElementsByTagName('li');
	//var tam='btn-lg';
	for(k=0;k<miscateg.length;k++){
		/*tam='btn-lg';
		if($(miscateg[k].hasClass( "btn-xs" )))
			tam='btn-xs';*/
		if(miscateg[k].id!='listaCategorias' && miscateg[k].id!='contenidoCategorias')
			miscateg[k].className="categoria esCategoria ";
	}
	cual.className="categoriaActiva esCategoria active";
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(
	function (tx){
		//console.log('SELECT * FROM PRODUCTOS WHERE categoriaid='+categoria+' and productofinal=1 and estado=1 ORDER BY formulado asc');
		tx.executeSql("SELECT * FROM IMPUESTOS WHERE activo=? order by id",["true"],function(tx,results3){
							console.log(results3);
							var impuestos='';
							var impuestosid='';
							if(results3.rows.length>0){
								console.log("encuentra impuestos");
								var cuan=0;
								for(var r=0;r<results3.rows.length;r++){
									var imp=results3.rows.item(r);
									if(cuan>0){
										impuestos+="@";
										impuestosid+="@";
									}
									impuestos+=parseFloat(imp.porcentaje)/100;
									impuestosid+=imp.timespan;
									cuan++;
								}
								console.log(impuestos+'/'+impuestosid);
								$('#impuestosactivos').html(impuestos);
								$('#impuestosactivosid').html(impuestosid);
								}
		});
								
		tx.executeSql('SELECT * FROM PRODUCTOS WHERE categoriaid='+categoria+' and productofinal=1 and estado=1 ORDER BY formulado asc',[],function(tx,res){
			//console.log(res);
			if(res.rows.length>0){
				//alert('prods');
				for(m=0;m<res.rows.length;m++){
					var impuestos='';
					var impuestosid='';
					var row=res.rows.item(m);
					if(isNaN(row.precio)){row.precio = 0;}
					if(row.tieneimpuestos=="true"){
						impuestos=$('#impuestosactivos').html();
						impuestosid=$('#impuestosactivosid').html();
					}
						var lineHeight='';
						if(row.formulado.length>12)
							lineHeight='line-height:18px;';
							
						$('#listaProductos').append('<div style="background-color:'+row.color+'; border:1px solid '+row.color+'; '+lineHeight+' text-transform:capitalize; " id="'+ row.timespan+'" data-precio="'+ row.precio +'" data-impuestos="'+impuestos +'" data-impuestosindexes="'+impuestosid +'" data-id_local = "'+row.id_local+'" data-formulado="'+ row.formulado +'" onclick="VerificarAgregados(this); return false;" ontap="VerificarAgregados(this); return false;" class="producto btn btn-lg btn-primary categoria_producto_'+row.categoriaid +'">'+ row.formulado +'</div>');
					
					/*if(row.cargaiva==1){
						impuestos+='0.12';
						impuestosid+='1';
					}
					if(row.servicio==1){
						if(row.cargaiva==1){
							impuestos+='@';
							impuestosid+='@';
						}
						impuestos+='0.10';
						impuestosid+='2';
					}*/
				}
				if($(window).height()>500){
						Init31();
					}
					else{
						Init3();
					}
				$('#listaProductos').css("display","");
				showProducts(categoria);
			}
		});				
	},errorCB,successCB);
	
	
	$('.producto').hide();
	if($(window).height()>500){
			Init31();
		}
		else{
			Init3();	
		}

	showProducts(categoria);
}
	


function showProducts(categoria,direction){
	$('#loader').hide();
	$('.producto').hide();
	$('#listaProductos').hide();
	var listaProductosWidth = $('#listaProductos').width();
	var listaProductosHeight = $('#listaProductos').height();
	var productosWidth = 0;
	var fixedProdtuctosHeight = 0;
	var fixedProdtuctosWidth = 0;

	$('.categoria_producto_'+ categoria).each(function(){
		productosWidth += parseInt($(this).outerWidth());
		fixedProdtuctosHeight = parseInt($(this).outerHeight());
		fixedProdtuctosWidth = parseInt($(this).outerWidth());
		});
	
	var maxProductsPerRow = Math.floor(listaProductosWidth/fixedProdtuctosWidth);
	var maxProductsPerColumn = Math.floor(listaProductosHeight/fixedProdtuctosHeight); 
	var maxProductsPerSection = parseInt(maxProductsPerRow) * parseInt(maxProductsPerColumn);
	var counter = 0;
	var pager = $('#pager').val();
	$('.categoria_producto_'+ categoria).each(function(index,value){
				$('#listaProductos').show();
				$(this).show();
	});
	$('#maxPage').val(counter);
}


function agregarCompra(item,origen){
	
	var i = 1;
	$('#descuentoFactura').val(0);
	$('#resultBuscador').fadeOut('slow');
	//variables facturacion
	var subtotalSinIva = $('#subtotalSinIva').val();
	var subtotalIva = $('#subtotalIva').val();
	
	//variables compra
	var total = 0;
	var sumTotal = 0;
	var taxTotal = 0;
	var productoCantidad = 1;
	if(currentCantidad != 0 && currentAction=='+') {
		productoCantidad = currentCantidad;
		currentAction='';
		currentCantidad=0;
		
	}
	
	var productoID = $(item).attr('id');
	if(origen==2){
		var idpartes= $(item).attr('id').split('_');
		productoID = idpartes[1];
	}
	var productoNombre = $(item).data('formulado');
	var id_local = $(item).data('id_local');
	var productoImpuestos = $(item).attr('data-impuestos');
	var productoImpuestosIndexes = $(item).attr('data-impuestosindexes');
	var productoPrecio = $(item).data('precio');
	var productoAgregados = $(item).attr('data-modificadores');
	//alert(productoAgregados);
	var subtotalSinIvaCompra = 0;
	var subtotalIvaCompra = 0;
	
	//agregados producto
	
	var vectoragregados=0;
	var tablaagregados="";
	var sumaagregados=0;
	if(productoAgregados!=''&&productoAgregados!=null&&productoAgregados!='undefined'){
		vectoragregados=productoAgregados.split('@');
		tablaagregados+="<table style='width:100%; font-size:10px; color:#808081;'>";
		for(var k in vectoragregados){
			var dataagregados=vectoragregados[k].split('|');
			tablaagregados+="<tr><td>"+dataagregados[0]+"</td><td style='text-align:right;'>$"+parseFloat(dataagregados[1]).toFixed(2)+"</td></tr>";
			sumaagregados+=parseFloat(dataagregados[1]);
		}
		tablaagregados+="</table>";
	}
	
	
	//verificar cantidades
	if(parseInt($.trim($('.cantidad').html())) != 0){
		productoCantidad = $.trim($('.cantidad').html());
	}
	//impuestos start
	if($.trim(productoImpuestosIndexes) != '' && $.trim(productoImpuestosIndexes) != 0){
		if($.trim(productoImpuestosIndexes).indexOf('@') !== -1){
			$.each(productoImpuestosIndexes.split('@'), function(index,value){
				if(productoImpuestosIndexes.indexOf(parseInt($('#idiva').html())) !== -1){
					subtotalIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados));
					}
				else{
					subtotalSinIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados));
					}
				
				if($('#impuestoFactura-'+ value).length == 0){
					
					var impuestoDetalles = $('#impuesto-'+ value).val().split('|');
					var currentimp=(parseFloat(productoCantidad) *( parseFloat(productoPrecio)+sumaagregados) * parseFloat(impuestoDetalles[2]));
					taxTotal+= currentimp;
					
					$('#factura').append('<input type="hidden" id="impuestoFactura-'+ value +'" class="esImpuesto" data-id="'+ impuestoDetalles[0] +'" data-nombre="'+ impuestoDetalles[1] +'" data-valor="'+ impuestoDetalles[2] +'" value="'+ currentimp +'"/>');
					}
				else{
					var impuestoDetalles = $('#impuesto-'+ value).val().split('|');
					var currentTax = $('#impuestoFactura-'+ value).val();
					var calcimp=((parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados)) * parseFloat(impuestoDetalles[2]));
					taxTotal += calcimp;

					$('#impuestoFactura-'+ value).val(parseFloat(currentTax) + parseFloat(calcimp));
					}
				});
			}
		else{
			productoImpuestosIndexes == parseInt($('#idiva').html()) ? subtotalIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados)) : subtotalSinIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados));
			
			if($('#impuestoFactura-'+productoImpuestosIndexes).length == 0){
				var impuestoDetalles = $('#impuesto-'+ productoImpuestosIndexes).val().split('|');
				taxTotal+= ((parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados)) * parseFloat(impuestoDetalles[2]));
				$('#factura').append('<input type="hidden" id="impuestoFactura-'+ productoImpuestosIndexes +'" class="esImpuesto" data-id="'+ impuestoDetalles[0] +'" data-nombre="'+ impuestoDetalles[1] +'" data-valor="'+ impuestoDetalles[2] +'" value="'+ taxTotal +'"/>');
				}
			else{
				var impuestoDetalles = $('#impuesto-'+ productoImpuestosIndexes).val().split('|');
				var currentTax = $('#impuestoFactura-'+ productoImpuestosIndexes).val();
				taxTotal+= ((parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados)) * parseFloat(impuestoDetalles[2]));
				$('#impuestoFactura-'+ productoImpuestosIndexes).val(parseFloat(currentTax) + parseFloat(taxTotal));
				}
			}
		}else{
			subtotalSinIvaCompra=(parseFloat(productoCantidad) * (parseFloat(productoPrecio)+sumaagregados));
		}
	//impuestos end
	var max=0;
	$('#tablaCompra tr').each(function(){
		var idtr=$(this).attr("id");
		//alert(idtr);
		if(idtr!=null){
			var dataid=idtr.split('_');
			if(parseInt(dataid[1])>=max)
				max=parseInt(dataid[1])+1;
		}
		
	});
	
	var total = ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) + parseFloat(taxTotal)+sumaagregados).toFixed(2);//YAESTA
	$('#tablaCompra').append('<tr id="cant_'+max+'"><td class="lineadetalle" data-borrarcantidad="'+ productoCantidad +'" data-borrarimpuesto="'+ productoImpuestos +'" data-borrarimpuestoindexes="'+ productoImpuestosIndexes +'" data-borrarprecio="'+ productoPrecio +'" data-agregados="'+sumaagregados+'" onclick="borrarCompra(this); return false;" style="width: 5%;"><button type="button" class="btn btn-danger btn-xs product_del"><span class="glyphicon glyphicon-remove" ></span></button><input type="hidden" class="totales" value="'+ total +'"/></td><td onclick="modificarCantidad('+max+' , '+id_local+')" style="border-right:1px solid #909192; text-align: center; width:20%;" class="lineadetalle" "><input type="hidden" class="productDetails" value="'+ productoID +'|'+ productoNombre +'|'+ productoCantidad +'|'+ productoPrecio +'|'+ productoPrecio +'|'+ productoImpuestos +'|'+ ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) + parseFloat(taxTotal)+parseFloat(sumaagregados)) +'|'+productoImpuestosIndexes+'|'+sumaagregados+'" data-detagregados="'+productoAgregados+'" /><input type="hidden" class="cantidadproductoscomandados" value="'+productoCantidad+'"/>'+productoCantidad +'</td><td style="border-right:1px solid #909192; padding-left:20px;text-align: left; width:50%; text-transform:capitalize;" class="lineadetalle">'+productoNombre+tablaagregados+'</td><td style="padding-right:20px; text-align: right;" class="lineadetalle">'+ parseFloat(total).toFixed(2) +'</td></tr>');
	$('.totales').each(function(){
		sumTotal += parseFloat($.trim($(this).val()));
		i++;
	});
	console.log (i+'cantidad');
	$('#'+productoID).attr("data-modificadores","");
	var sumcantidadComandada = 0;
	//alert($('.cantidadproductoscomandados').length)
	$('.cantidadproductoscomandados').each(function(){
		sumcantidadComandada += parseFloat($.trim($(this).val()));
		//alert($.trim($(this).val()));
	});
	console.log('los items facturados son'+sumcantidadComandada);
	$('#itemsVendidos').html(sumcantidadComandada);
	$('#espacioavisador').html("Tienes "+sumcantidadComandada+" pedidos. <a onclick='window.scrollTo(0,document.body.scrollHeight);'>Ver Cuenta al final.</a>");
	
	
	//alert(subtotalSinIva+'/'+subtotalSinIvaCompra);
	$('#totalmiFactura').val(sumTotal);
	$('#total').html('$'+ parseFloat(sumTotal).toFixed(2))
	$('#payButton').html('PAGAR $'+ parseFloat(sumTotal).toFixed(2))
	$('#justo').html(sumTotal.toFixed(2));
	$('#justo').attr('data-value',-1*sumTotal.toFixed(2));
	$('#redondeado').html(Math.ceil(sumTotal).toFixed(2));
	$('#redondeado').attr('data-value',-1*Math.ceil(sumTotal).toFixed(2));
	var alta=0;
	for( var t in misdenominaciones){
		if(misdenominaciones[t]>sumTotal)
		{
			alta=misdenominaciones[t];
			break;
		}
	}
	$('#altaden').html(alta.toFixed(2));
	$('#altaden').attr('data-value',-1*alta.toFixed(2));
	if(alta!=sumTotal&&alta!=Math.ceil(sumTotal)&&alta!=0)
		$('#altaden').parent().css('display','inline');
	else
		$('#altaden').parent().css('display','none');
	
	var prox10=0;
	var iter=1;
	var p10=iter*10;
	while(p10<sumTotal){
		iter++;
		p10=iter*10;
	}
	$('#prox10').html(p10.toFixed(2));
	$('#prox10').attr('data-value',-1*p10.toFixed(2));
	//console.log(p10+'/'+alta);
	if(p10>0&&p10!=alta)
		$('#prox10').parent().css('display','inline');
	else
		$('#prox10').parent().css('display','none');
	
	var prox20=0;
	var iter=1;
	var p20=iter*20;
	while(p20<sumTotal){
		iter++;
		p20=iter*20;
	}
	$('#prox20').html(p20.toFixed(2));
	$('#prox20').attr('data-value',-1*p20.toFixed(2));
	if(p20>0&&p20!=p10)
		$('#prox20').parent().css('display','inline');
	else
		$('#prox20').parent().css('display','none');
	
	
	
	$('#subtotalSinIva').val(parseFloat(subtotalSinIva) + parseFloat(subtotalSinIvaCompra));
	$('#subtotalIva').val(parseFloat(subtotalIva) + parseFloat(subtotalIvaCompra));
	$('.cantidad').html('0');
	$('#tableresults').html('');
	$('#inputbusc').val('');
	$('#contentdetalle').animate({
		scrollTop: $('#contentdetalle')[0].scrollHeight
		}, 1000).clearQueue();
	$('#tablaCompra tr:last-child').effect('highlight',{},'normal');
	celdaenfocada=-1;
	PlaySound(0);
	/*$('.lineadetalle').css('font-size',$('.lineadetalle').css('font-size'));
	if(vertical==true)
		$('.product_del').css('width',(pantAlto*2.7/100)+'px');
	else
		$('.product_del').css('width',(pantAlto*3/100)+'px');*/
	$('.product_del').on('click',function(){
			PlaySound(4);
	});
	
	//init2();
}

function agregarCompra2(item,origen){
	var i = 1;
	$('#descuentoFactura').val(0);
	$('#resultBuscador').fadeOut('slow');
	//variables facturacion
	var subtotalSinIva = $('#subtotalSinIva').val();
	var subtotalIva = $('#subtotalIva').val();
	
	//variables compra
	var total = 0;
	var sumTotal = 0;
	var taxTotal = 0;
	var productoCantidad = 1;
	var productoID = $(item).attr('id');
	if(origen==2){
		var idpartes= $(item).attr('id').split('_');
		productoID = idpartes[1];
	}
	var productoNombre = $(item).data('formulado');
	var id_local = $(item).data('id_local');
	var productoImpuestos = $(item).data('impuestos');
	var productoImpuestosIndexes = $(item).data('impuestosindexes');
	var productoPrecio = $(item).data('precio');
	var subtotalSinIvaCompra = 0;
	var subtotalIvaCompra = 0;
	
	//verificar cantidades
	if(parseInt($.trim($('.cantidad').html())) != 0){
		productoCantidad = $.trim($('.cantidad').html());
	}
	
	// else{
		// productoCantidad = $('#modificaCantidadActual').val();
	// }
	//impuestos start
	if($.trim(productoImpuestosIndexes) != '' && $.trim(productoImpuestosIndexes) != 0){
		if($.trim(productoImpuestosIndexes).indexOf('@') !== -1){
			$.each(productoImpuestosIndexes.split('@'), function(index,value){
				
				if(productoImpuestosIndexes.indexOf('1') !== -1){
					subtotalIvaCompra = (parseFloat(productoCantidad) * parseFloat(productoPrecio));
					}
				else{
					subtotalSinIvaCompra = (parseFloat(productoCantidad) * parseFloat(productoPrecio));
					}
				
				if($('#impuestoFactura-'+ value).length == 0){
					var impuestoDetalles = $('#impuesto-'+ value).val().split('|');
					taxTotal += ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) * parseFloat(impuestoDetalles[2]));
					$('#factura').append('<input type="hidden" id="impuestoFactura-'+ value +'" class="esImpuesto" data-id="'+ impuestoDetalles[0] +'" data-nombre="'+ impuestoDetalles[1] +'" data-valor="'+ impuestoDetalles[2] +'" value="'+ taxTotal +'"/>');
					}
				else{
					var impuestoDetalles = $('#impuesto-'+ value).val().split('|');
					var currentTax = $('#impuestoFactura-'+ value).val();
					taxTotal += ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) * parseFloat(impuestoDetalles[2]));
					$('#impuestoFactura-'+ value).val(parseFloat(currentTax) + parseFloat(taxTotal));
					}
				});
			}
		else{
			productoImpuestosIndexes == 1 ? subtotalIvaCompra = (parseFloat(productoCantidad) * parseFloat(productoPrecio)) : subtotalSinIvaCompra = (parseFloat(productoCantidad) * parseFloat(productoPrecio));
			
			if($('#impuestoFactura-'+productoImpuestosIndexes).length == 0){
				var impuestoDetalles = $('#impuesto-'+ productoImpuestosIndexes).val().split('|');
				taxTotal = ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) * parseFloat(impuestoDetalles[2]));
				$('#factura').append('<input type="hidden" id="impuestoFactura-'+ productoImpuestosIndexes +'" class="esImpuesto" data-id="'+ impuestoDetalles[0] +'" data-nombre="'+ impuestoDetalles[1] +'" data-valor="'+ impuestoDetalles[2] +'" value="'+ taxTotal +'"/>');
				}
			else{
				var impuestoDetalles = $('#impuesto-'+ productoImpuestosIndexes).val().split('|');
				var currentTax = $('#impuestoFactura-'+ productoImpuestosIndexes).val();
				taxTotal = ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) * parseFloat(impuestoDetalles[2]));
				$('#impuestoFactura-'+ productoImpuestosIndexes).val(parseFloat(currentTax) + parseFloat(taxTotal));
				}
			}
		}
	//impuestos end
	$('.totales').each(function(){
		i++;
	});
	
	var total = ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) + parseFloat(taxTotal)).toFixed(2);//YAESTA
	$('#tablaCompra').append('<tr id="cant_'+i+'"><td class="lineadetalle" data-borrarcantidad="'+ productoCantidad +'" data-borrarimpuesto="'+ productoImpuestos +'" data-borrarimpuestoindexes="'+ productoImpuestosIndexes +'" data-borrarprecio="'+ productoPrecio +'" onclick="borrarCompra(this); return false;" style="width: 5%;"><button type="button" class="btn btn-danger btn-xs product_del"><span class="glyphicon glyphicon-remove" ></span></button><input type="hidden" class="totales" value="'+ total +'"/></td><td style="border-right:1px solid #909192; text-align: center; width:20%;" class="lineadetalle" "><input type="hidden" class="productDetails" value="'+ productoID +'|'+ productoNombre +'|'+ productoCantidad +'|'+ productoPrecio +'|'+ productoPrecio +'|'+ productoImpuestos +'|'+ ((parseFloat(productoCantidad) * parseFloat(productoPrecio)) + parseFloat(taxTotal)) +'" /><input type="hidden" class="cantidadproductoscomandados" value="'+productoCantidad+'"/>'+ productoCantidad +'</td><td style="border-right:1px solid #909192; padding-left:20px;text-align: left; width:50%; text-transform:capitalize;" class="lineadetalle">'+ productoNombre+'</td><td style="padding-right:20px; text-align: right;" class="lineadetalle">'+ parseFloat(total).toFixed(2) +'</td></tr>');
	$('.totales').each(function(){
		sumTotal += parseFloat($.trim($(this).val()));
		i++;
	});
	//console.log (i+'cantidad');
	
	var sumcantidadComandada = 0;
	$('.cantidadproductoscomandados').each(function(){
		sumcantidadComandada += parseFloat($.trim($(this).val()));
	});
	
	console.log('los items facturados son'+sumcantidadComandada);
	$('#itemsVendidos').html(sumcantidadComandada);
	/*$('#itemsVendidos').css('display','block');
	$('#itemsVendidos').css('background-color','red');*/
	//alert('los items facturados son'+sumcantidadComandada);
	
	
	//alert(subtotalSinIva+'/'+subtotalSinIvaCompra);
	$('#totalmiFactura').val(sumTotal);
	$('#total').html('$'+ parseFloat(sumTotal).toFixed(2))
	$('#justo').html(sumTotal.toFixed(2));
	$('#justo').attr('data-value',-1*sumTotal.toFixed(2));
	$('#redondeado').html(Math.ceil(sumTotal).toFixed(2));
	$('#redondeado').attr('data-value',-1*Math.ceil(sumTotal).toFixed(2));
	var alta=0;
	for( var t in misdenominaciones){
		if(misdenominaciones[t]>sumTotal)
		{
			alta=misdenominaciones[t];
			break;
		}
	}
	$('#altaden').html(alta.toFixed(2));
	$('#altaden').attr('data-value',-1*alta.toFixed(2));
	if(alta!=sumTotal&&alta!=Math.ceil(sumTotal)&&alta!=0)
		$('#altaden').parent().css('display','inline');
	else
		$('#altaden').parent().css('display','none');
	
	var prox10=0;
	var iter=1;
	var p10=iter*10;
	while(p10<sumTotal){
		iter++;
		p10=iter*10;
	}
	$('#prox10').html(p10.toFixed(2));
	$('#prox10').attr('data-value',-1*p10.toFixed(2));
	//console.log(p10+'/'+alta);
	if(p10>0&&p10!=alta)
		$('#prox10').parent().css('display','inline');
	else
		$('#prox10').parent().css('display','none');
	
	var prox20=0;
	var iter=1;
	var p20=iter*20;
	while(p20<sumTotal){
		iter++;
		p20=iter*20;
	}
	$('#prox20').html(p20.toFixed(2));
	$('#prox20').attr('data-value',-1*p20.toFixed(2));
	if(p20>0&&p20!=p10)
		$('#prox20').parent().css('display','inline');
	else
		$('#prox20').parent().css('display','none');
	
	
	
	$('#subtotalSinIva').val(parseFloat(subtotalSinIva) + parseFloat(subtotalSinIvaCompra));
	$('#subtotalIva').val(parseFloat(subtotalIva) + parseFloat(subtotalIvaCompra));
	$('.cantidad').html('0');
	$('#tableresults').html('');
	$('#inputbusc').val('');
	$('#contentdetalle').animate({
		scrollTop: $('#contentdetalle')[0].scrollHeight
		}, 1000).clearQueue();
	$('#tablaCompra tr:last-child').effect('highlight',{},'normal')
	celdaenfocada=-1;
	/*$('.lineadetalle').css('font-size',$('.lineadetalle').css('font-size'));
	if(vertical==true)
		$('.product_del').css('width',(pantAlto*2.7/100)+'px');
	else
		$('.product_del').css('width',(pantAlto*3/100)+'px');*/
	$('.product_del').on('click',function(){
			PlaySound(4);
	});
	
	//init2();
}
function modificarCantidad(i,id_local){
	//console.log(id_local);
	$('#popupCantidad').modal("show");
	$('#modificaCantidadActual').html('1');
	$('#recibeIdentificadorTr').val(i);
	$('#productoIDAcambiar').val(id_local);
}

function cambiarCantidad(){
	var i = 0;
	var identificadorTr = $('#recibeIdentificadorTr').val();
	var cantidadActual = $('#modificaCantidadActual').html();
	var productoIDAcambiar = $('#productoIDAcambiar').val();
	
	//var sumaagregados=0;
	var tdagregados=$('#cant_'+identificadorTr+' td')[0];
	//console.log(tdagregados);
	var sumaagregados=0;
	//alert($(tdagregados).attr("data-agregados"));
	if($(tdagregados).attr("data-agregados")!=null&&$(tdagregados).attr("data-agregados")!=""&&$(tdagregados).attr("data-agregados")!="undefined")
		sumaagregados=parseFloat($(tdagregados).attr("data-agregados"));
	var tddetalles=$('#cant_'+identificadorTr+' td')[1];
	var inpdetalleagregados=$(tddetalles).find('.productDetails');
	var detalleagregados=inpdetalleagregados.attr("data-detagregados");
	var tdhtml=$('#cant_'+identificadorTr+' td')[2];
	var htmlprod=$(tdhtml).html();
	
	$('#cant_'+identificadorTr).remove();
	
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(function(tx){
		tx.executeSql('SELECT COUNT(id_local) as cuantos FROM PRODUCTOS WHERE id_local='+productoIDAcambiar+';',[],function(tx,res){
			var existen=res.rows.item(0).cuantos;
			if(existen==0){
				alert('no existe ese producto');
				$('.cantidad').html('0.00');
			}else{
				$('.cantidad').html('0.00');
				//alert('hola')
				tx.executeSql('SELECT * FROM PRODUCTOS WHERE id_local='+productoIDAcambiar+';',[],function(tx,result){
					//alert(result);
					for (var i=0; i <= result.rows.length-1; i++){
						var row = result.rows.item(i);
						var productoNombre = row.formulado;
						var productoCantidad = cantidadActual;
						var cargaiva = row.cargaiva;
						var servicio = row.servicio;
						var productoImpuestosIndexes ='';
						var productoImpuestos='';
						var productomas=1;
						if(row.tieneimpuestos=="true"){
							productoImpuestos=$('#impuestosactivos').html();
							productoImpuestosIndexes=$('#impuestosactivosid').html();
							var porcentajes=productoImpuestos.split('@');
							for(var l in porcentajes){
								if(porcentajes[l]!=null&&porcentajes[l]!=""&&porcentajes[l]!='undefined')
									productomas+=parseFloat(porcentajes[l]);
							}
						}
						/*if(cargaiva == 1){
							productoImpuestos= "0.12";
							productoImpuestosIndexes+='1';
							productomas+=0.12;
						}
						
						if(servicio == 1){
							productoImpuestos +="@0.10";
							productoImpuestosIndexes+='@2';
							productomas+=0.10;
						}*/
						
						var productoPrecio = row.precio;
						var total = (((parseFloat(productoPrecio)+sumaagregados) * parseInt(productoCantidad))*parseFloat(productomas)).toFixed(2);
						console.log(productoPrecio);
						var productoID = row.timespan;
						//console.log(formulado);
					
						var sumTotal = 0;
						
						/**/
						
						//YAESTA
						$('#tablaCompra').append('<tr id="cant_'+identificadorTr+'"><td class="lineadetalle" data-borrarcantidad="'+ productoCantidad +'" data-borrarimpuesto="'+ productoImpuestos +'" data-borrarimpuestoindexes="'+ productoImpuestosIndexes +'" data-agregados="'+sumaagregados+'" data-borrarprecio="'+ productoPrecio +'" onclick="borrarCompra(this); return false;" style="width: 5%;"><button type="button" class="btn btn-danger btn-xs product_del"><span class="glyphicon glyphicon-remove" ></span></button><input type="hidden" class="totales" value="'+ total +'"/></td><td onclick="modificarCantidad('+identificadorTr+' , '+productoIDAcambiar+')" style="border-right:1px solid #909192; text-align: center; width:20%;" class="lineadetalle" "><input type="hidden" class="productDetails" value="'+ productoID +'|'+ productoNombre +'|'+ productoCantidad +'|'+ productoPrecio +'|'+ productoPrecio +'|'+ productoImpuestos +'|'+ total +'|'+productoImpuestosIndexes+'|'+sumaagregados+'" data-detagregados="'+detalleagregados+'" /><input type="hidden" class="cantidadproductoscomandados" value="'+productoCantidad+'"/>'+ productoCantidad +'</td><td style="border-right:1px solid #909192; padding-left:20px;text-align: left; width:50%; text-transform:capitalize;" class="lineadetalle">'+ htmlprod+'</td><td style="padding-right:20px; text-align: right;" class="lineadetalle">'+ parseFloat(total).toFixed(2) +'</td></tr>');
						$('.totales').each(function(){
							sumTotal += parseFloat($.trim($(this).val()));
						});
						console.log('tu factura es de : ' + sumTotal);
						var sumcantidadComandada = 0;
						$('.cantidadproductoscomandados').each(function(){
							sumcantidadComandada += parseFloat($.trim($(this).val()));
						});
						console.log('los items facturados son'+sumcantidadComandada);
						$('#itemsVendidos').html(sumcantidadComandada);
						/*$('#itemsVendidos').css('display','block');
						$('#itemsVendidos').css('background-color','red');*/
						$('#total').html('$'+sumTotal.toFixed(2));
						$('#justo').html(sumTotal.toFixed(2));
						$('#payButton').html('PAGAR $'+sumTotal.toFixed(2));
						$('#changeFromPurchase').html(sumTotal.toFixed(2));
						$('#totalmiFactura').val(sumTotal);
						$('#total').html('$'+ parseFloat(sumTotal).toFixed(2))
						$('#justo').html(sumTotal.toFixed(2));
						$('#justo').attr('data-value',-1*sumTotal.toFixed(2));
						$('#redondeado').html(Math.ceil(sumTotal).toFixed(2));
						$('#redondeado').attr('data-value',-1*Math.ceil(sumTotal).toFixed(2));
						var alta=0;
						for( var t in misdenominaciones){
							if(misdenominaciones[t]>sumTotal)
							{
								alta=misdenominaciones[t];
								break;
							}
						}
						$('#altaden').html(alta.toFixed(2));
						$('#altaden').attr('data-value',-1*alta.toFixed(2));
						if(alta!=sumTotal&&alta!=Math.ceil(sumTotal)&&alta!=0)
							$('#altaden').parent().css('display','inline');
						else
							$('#altaden').parent().css('display','none');
						
						var prox10=0;
						var iter=1;
						var p10=iter*10;
						while(p10<sumTotal){
							iter++;
							p10=iter*10;
						}
						$('#prox10').html(p10.toFixed(2));
						$('#prox10').attr('data-value',-1*p10.toFixed(2));
						//console.log(p10+'/'+alta);
						if(p10>0&&p10!=alta)
							$('#prox10').parent().css('display','inline');
						else
							$('#prox10').parent().css('display','none');
						
						var prox20=0;
						var iter=1;
						var p20=iter*20;
						while(p20<sumTotal){
							iter++;
							p20=iter*20;
						}
						$('#prox20').html(p20.toFixed(2));
						$('#prox20').attr('data-value',-1*p20.toFixed(2));
						if(p20>0&&p20!=p10)
							$('#prox20').parent().css('display','inline');
						else
							$('#prox20').parent().css('display','none');

						var subsinivanew=0;
						var subconivanew=0;
						var ivanew=0;
						var servnew=0;
						var impgenerales=new Array();
						$('.productDetails').each(function(){
							var datosimp=$(this).val().split('|');
							var newsumaagregados=parseFloat(datosimp[8]);
							var vectorimp=datosimp[7].split('@');
							
							//alert(datosimp[7]);
							for(var x=0;x<vectorimp.length;x++){
								var taxnow=vectorimp[x];
								if(taxnow!=''&&taxnow!='undefined'&&taxnow!=null){
									if('"'+taxnow+'"' in impgenerales){
									var antes=impgenerales['"'+taxnow+'"'];
									var datosp=$('#impuesto-'+taxnow).val().split('|');
									var porcent=parseFloat(datosp[2]);
									impgenerales['"'+taxnow+'"']=antes+((parseFloat(datosimp[3])+newsumaagregados)*parseFloat(datosimp[2])*porcent);
									}else{
										//alert(taxnow);
										var datosp=$('#impuesto-'+taxnow).val().split('|');
										var porcent=parseFloat(datosp[2]);
										impgenerales['"'+taxnow+'"']=((parseFloat(datosimp[3])+newsumaagregados)*parseFloat(datosimp[2])*porcent);
									}
								}
							}
							

							if(datosimp[7].indexOf($('#idiva').html())>=0&&$('#idiva').html()!=''){
								subconivanew+=(parseFloat(datosimp[3])+newsumaagregados)*parseFloat(datosimp[2]);
								var datosp=$('#impuesto-'+$('#idiva').html()).val().split('|');
								var porcentiva=parseFloat(datosp[2]);
								ivanew+=(parseFloat(datosimp[3])+newsumaagregados)*parseFloat(datosimp[2])*porcentiva;
							}
							else{
								subsinivanew+=(parseFloat(datosimp[3])+newsumaagregados)*parseFloat(datosimp[2]);
							}
							
							//para servicio
							//if(datosimp[7].indexOf('2')>=0){
								servnew+=(parseFloat(datosimp[3])+newsumaagregados)*0.10*parseFloat(datosimp[2]);
							//}
						});
						
						console.log(impgenerales);
						for(var j in impgenerales){
							$('#impuestoFactura-'+(j.replace(/"/g,''))).val(impgenerales[j]);
						}
						
						
						$('#subtotalSinIva').val(subsinivanew);
						$('#subtotalIva').val(subconivanew);
						
						
						$('.cantidad').html('0');
						$('#tableresults').html('');
						$('#inputbusc').val('');
						$('#contentdetalle').animate({
							scrollTop: $('#contentdetalle')[0].scrollHeight
							}, 1000).clearQueue();
						$('#tablaCompra tr:last-child').effect('highlight',{},'normal')
						celdaenfocada=-1;
	
					}
				},errorCB,successCB);
				
			}
		},errorCB,successCB);
			});
	
	closePopup2();
}

function formarCategorias(){
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	var selected = '';
	var categoriaSelected = 0;
	var objcategoria='';
	db.transaction(
	function (tx){
		tx.executeSql('SELECT c.* FROM CATEGORIAS c, PRODUCTOS p where c.timespan in (p.categoriaid) and p.productofinal=1 and p.estado=1 group by categoria ORDER BY categoria asc',[],function(tx,res){
			if(res.rows.length>0){
				for(m=0;m<res.rows.length;m++){
					selected = 'categoria';
					var row=res.rows.item(m);
					if(m==0){
						selected = 'categoriaActiva';
						categoriaSelected = row.timespan;
					}
					console.log("idc:"+row.timespan);
					$('#listacat').append('<li id="categoria_'+ row.timespan +'" class="esCategoria '+ selected +'" onclick="ActivarCategoria(this,'+"'"+ row.timespan +"'"+');" ontap="ActivarCategoria(this,'+"'"+ row.timespan +"'"+');" ><a>'+ (row.categoria).substring(0,20) +'</a></li>');
				}
				objcategoria=$('#categoria_'+categoriaSelected)[0];
				console.log(objcategoria);
				ActivarCategoria(objcategoria,categoriaSelected);
			}else{
				$("#menuproductos").html("<b>Ingrese Productos o Sincronice</b>");
			}
		});				
	},errorCB,successCB);
}


var margin = 0;
var lastDiv = 0;
function slider(direccion){
	var slide = margin;
	var maxSlide = -Math.abs($('#contenidoCategorias').width());
	if(direccion == 'derecha'){
		$('.esCategoria ').each(function(){
			if(slide <= parseInt($('#listaCategorias').width())){
				lastDiv = $(this).outerWidth();
				slide += $(this).outerWidth();
				}
			});
		margin -= (slide - lastDiv);
		}
	else{
		$('.esCategoria').each(function(){
			if(slide - lastDiv <= parseInt($('#listaCategorias').width())){
				slide += $(this).outerWidth();
				}
			});
		margin += (slide);
		}
		
	console.log(margin);
	
	if(parseInt(margin) > 0){
		margin = 0;
		}
	else if(margin <= maxSlide){
		margin = maxSlide;
		return false;
		}
	$('#contenidoCategorias').animate({
		marginLeft: margin
		});
	}
	
function pagar(){
	//lert('viene a pagar');
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	var serie='001';
	var establecimiento='001';
	var encabezado=0;
	var largo=0;
		db.transaction(function (tx){
			tx.executeSql('SELECT establecimiento,serie,largo,encabezado from config where id=1',[],function(tx,res2){
				serie=res2.rows.item(0).serie;
				establecimiento=res2.rows.item(0).establecimiento;
				//alert(serie+'/'+establecimiento);
				$('#seriesfact').html(establecimiento+'-'+serie+'-');
				localStorage.setItem("encabezado",res2.rows.item(0).encabezado);
				localStorage.setItem("largo",res2.rows.item(0).largo);
			});
			tx.executeSql('SELECT MAX(aux)+1 as max FROM FACTURAS',[],
			function(tx,res){
				
				console.log(res);
				var ceros='';
				var coun=0;
				var nfact='1';
				if(res.rows.length>0){
					var max=1;
					if(res.rows.item(0).max!=null)
						max=res.rows.item(0).max;
					else{
						if(localStorage.getItem("ultimafact")!=null&&localStorage.getItem("ultimafact")!="")
							max=parseInt(localStorage.getItem("ultimafact"))+1;
					}
						
					
					coun=max.toString().length;
					nfact=max.toString();
				}
				
				var ceroscount=0;
				while(ceroscount<(9-coun)){
					ceros+='0';
					ceroscount++;
				}
				$('#invoiceNr').val(ceros+nfact);
				$('#invoiceNrComplete').val(establecimiento+'-'+serie+'-'+ceros+nfact);
			});
		});

	var subtotalSinIva = $('#subtotalSinIva').val();
	var subtotalIva = $('#subtotalIva').val();
	var descuento = $('#descuentoFactura').val();
    var total = $('#totalmiFactura').val();
    var nofactura = $('#invoiceNrComplete').val();
	
	var pagado=0;
	$('.paymentMethods').each(function(){
		if($(this).val()!='')
			pagado+=parseFloat($(this).val());
	})
	
	//if($('#timespanFactura').val()=='')
	$('#timespanFactura').val(getTimeSpan());
    var timefactura = $('#timespanFactura').val();
	total=parseFloat(total);
	/*$('#justo').html(total.toFixed(2));
	$('#justo').attr('data-value',-1*total.toFixed(2));
	$('#redondeado').html(Math.round(total).toFixed(2));
	$('#redondeado').attr('data-value',-1*Math.round(total).toFixed(2));*/
	var discount = parseFloat($('#descuentoFactura').val());
	console.log(discount);
	if(discount == 0){
		$('#changeFromPurchase').html((total-pagado).toFixed(2));
	}else{
		$('#changeFromPurchase').html((total-discount-pagado).toFixed(2));
	}
	//$('#changeFromPurchase').html((total-discount).toFixed(2));
	if((total-pagado)<=0)
		$('#invoiceDebt').html('VUELTO');
	else
		$('#invoiceDebt').html('FALTANTE');

	var idimpuestos = '';
	var ivavalor=0;
	var servalor=0;
	var dataimpuestos="";
	var c=0;
	
	$('.esImpuesto').each(function(){
		var getName = $(this).data('nombre');
		var getId = $(this).data('id');
		var getValue = $(this).data('valor');
		//idimpuestos += getName +'/'+ $(this).val() +'/'+ getId +'/'+ getValue +'@';
		idimpuestos += getId+'@';
		if(getId==parseInt($('#idiva').html()))
			ivavalor=$(this).val();
		
		if(c>0){
			dataimpuestos+="@";
		}	
		dataimpuestos+=getId+"|"+getName+"|"+getValue+"|"+$(this).val();
		c++;
	});
	
	idimpuestos = idimpuestos.substring(0,idimpuestos.length -1);
	
	

    //alert(subtotalSinIva+'**'+subtotalIva+'**'+descuento+'**'+impuestos);
	//var total = parseFloat(subtotalSinIva) + parseFloat(subtotalIva) + parseFloat(impuestos) - parseFloat(descuento);
	
	var json = '{"Pagar": [{';
		json += ' "cliente": {';
			json +=	'"id_cliente": "'+$('#idCliente').val()+'",';
			json +=	'"cedula": "'+$('#cedulaP').val()+'",';
			json +=	'"nombre": "'+$('#nombreP').val()+'",';
			json +=	'"telefono": "'+$('#telefonoP').val()+'",';
			json +=	'"email": "'+$('#emailP').val()+'",';
			json +=	'"direccion": "'+$('#direccionP').val()+'",';
			json +=	'"listaDePrecio": ""';
			json +=	'},';
			json += '"producto": [';
	$('.productDetails').each(function(){
		var splitDetails = $(this).val().split('|');
		var detalleagregados="";
		if($(this).attr("data-detagregados")!=''&&$(this).attr("data-detagregados")!=null&&$(this).attr("data-detagregados")!='undefined')
		   detalleagregados=$(this).attr("data-detagregados");
	   
		json += '{';
			json += '"id_producto" : "'+ splitDetails[0] +'",';
			json += '"timespanproducto" : "'+ splitDetails[0] +'",';
			json += '"timespanconsumo" : "'+getTimeSpan()+'",';
			json += '"nombre_producto" : "'+ splitDetails[1] +'",';
			json += '"cant_prod" : "'+ splitDetails[2] +'",';
			json += '"precio_orig" : "'+ splitDetails[3] +'",';
			json += '"precio_prod" : "'+ splitDetails[4] +'",';
			json += '"impuesto_prod" : "'+ splitDetails[7] +'",';
			json += '"precio_total" : "'+ splitDetails[6] +'",';
			json += '"precio_descuento_justificacion" : "",';
			json += '"agregados" : "'+splitDetails[8]+'",';
			json += '"detalle_agregados" : "'+detalleagregados+'"';
		json += '},';
		});
		
	var midevice='';
	if($('#deviceid').html()!=''){
		midevice=$('#deviceid').html();
	}
	//alert(device+'/'+device.model + '/' +'Device Cordova: '  + device.cordova  + '/' +'Device Platform: ' + device.platform + '/' +'Device UUID: '     + device.uuid     + '/' +'Device Version: '  + device.version);
		
	json = json.substring(0,json.length -1);	
	json += '],'
	json += '"factura" : {';
		json += '"subtotal_sin_iva" : "'+ subtotalSinIva +'",';
		json += '"timespanfactura" : "'+ timefactura +'",';
		json += '"idbarrascajas" : "'+midevice+'",';
		json += '"fecha" : "'+ new Date().getTime() +'",';
		json += '"anulada" : "false",';
		json += '"subtotal_iva" : "'+ subtotalIva +'",';
		json += '"impuestos" : "'+ idimpuestos +'",';
		json += '"iva" : "'+ ivavalor +'",';
		json += '"servicio" : "'+ servalor +'",';
		json += '"descuento" : "'+ descuento +'",';
		json += '"total" : "'+ (total-descuento) +'",';
		json += '"numerofact" : "'+ nofactura +'",';
		json += '"encabezado" : "'+ localStorage.getItem("encabezado") +'",';
		json += '"largo" : "'+ localStorage.getItem("largo") +'",';
		json += '"impuestosdata" : "'+ dataimpuestos +'",';
		json += '"ordername" : "'+ localStorage.getItem("nameorder") +'"';
		json += '},';
		json +=$('#JSONempresaLocal').html()+'"pagos":[';
		
		var nformas=0;
		var cadefectivo='';
		var cadtarjetas='';
		var cadcheques='';
		var cadcxc='';
		
		if($('#paymentEfectivo').val()!=''&&parseFloat($('#paymentEfectivo').val())>0)
		{	
			cadefectivo+='{"forma":"efectivo","valor":"'+$('#paymentEfectivo').val()+'","tipotarjeta":"","lote":"","numerocheque":"","banco":""}';
			nformas++;
		}
		
		var count=0;
		var mivuelto=parseFloat($('#invoicePaid').html())-parseFloat($('#total').html().substr(1));
		//alert(mivuelto);
		if(mivuelto>0)
		{
			if(nformas>0&&count==0)
					cadefectivo+=',';
			if(count>0)
					cadefectivo+=',';
				
			cadefectivo+='{"forma":"efectivo","valor":"-'+mivuelto+'","tipotarjeta":"","lote":"","numerocheque":"","banco":""}';
			nformas++;
			count++;
		}
		
		
		
		$('.cardv').each(function(){
			if($(this).html()!=''&&parseFloat($(this).parent().attr("data-value"))>0){
				
				if(nformas>0&&count==0)
					cadtarjetas+=',';
		
				if(count>0)
					cadtarjetas+=',';
				
				cadtarjetas+='{"forma":"tarjetas","valor":"'+parseFloat($(this).parent().attr("data-value"))+'","tipotarjeta":"'+parseFloat($(this).parent().attr("data-id"))+'","lote":"","numerocheque":"","banco":""}';
				count++;
				nformas++;
			}
				
		});
		
		
		var count=0;
			if($('#valorcheque1').val()!=''&&parseFloat($('#valorcheque1').val())>0){
				if(nformas>0&&count==0)
					cadcheques+=',';
				
				if(count>0)
					cadcheques+=',';
				cadcheques+='{"forma":"cheques","valor":"'+$('#valorcheque1').val()+'","tipotarjeta":"","lote":"","numerocheque":"'+$('#chequeno1').val()+'","banco":""}';
				count++;
				nformas++;
			}
				
		//alert(cadtarjetas);
		
		if(cadefectivo!='') json+=cadefectivo;
		if(cadtarjetas!='') json+=cadtarjetas;
		if(cadcheques!='') json+=cadcheques;
		if($('#valorcxc').val()!=''&&parseFloat($('#valorcxc').val())>0){
			if(nformas>0)
				json+=',';
			json+='{"forma":"cxc","valor":"'+$('#valorcxc').val()+'","tipotarjeta":"","lote":"","numerocheque":"","banco":"'+$('#justcxc').val()+'"}';
		} 	
		json+=']}]}';
		
		$('#json').html(json);
		//alert("Ana");
		receiveJson();	
	//$('#pay').show();
}
	
function addDiscount(){
	var discount = parseFloat($('#addDiscount').html());
	var totalmiFactura = parseFloat($('#totalmiFactura').val());
	if($('.productDetails').length > 0){
		if(discount <= totalmiFactura){
			var getTotal = $('#total').val();
			if(parseFloat(discount) > parseFloat(getTotal)){
				discount = parseFloat($('#total').val());
				$('#addDiscount').html(parseFloat(getTotal).toFixed(2));
				}
				
			if(discount == ''){
				discount = 0;
				$('#addDiscount').html('0');
				}
				
			if(parseFloat(discount) < 0){
				discount = 0;
				$('#addDiscount').html('0');
				}
			
			var totales = 0;
			$('.totales').each(function(){
				totales += parseFloat($(this).val());
			});

			$('#discountAdded').fadeIn();
			//$('#totalmiFactura').val(parseFloat(totales) + parseFloat(discount));
			$('#totalmiFactura').val(parseFloat(totales));
			$('#total').html('$'+ (parseFloat(totales) - parseFloat(discount)).toFixed(2));
			$('#payButton').html('PAGAR $'+ (parseFloat(totales) - parseFloat(discount)).toFixed(2));
			$('#descuentoFactura').val(discount);
			
			//alert(discount);
			
			$('#popupDiscount').modal("hide");
			var sumTotal = 0;
			$('.totales').each(function(){
				sumTotal += parseFloat($.trim($(this).val()));
			});
			console.log((parseFloat(totales) - parseFloat(discount)).toFixed(2));
			$('#justo').html((parseFloat(totales) - parseFloat(discount)).toFixed(2));
			$('#justo').attr('data-value',-1*(parseFloat(totales) - parseFloat(discount)).toFixed(2));
			$('#redondeado').html(Math.ceil((parseFloat(totales) - parseFloat(discount))).toFixed(2));
			$('#changeFromPurchase').html((parseFloat(totales) - parseFloat(discount)).toFixed(2));
			$('#redondeado').attr('data-value',-1*Math.ceil((parseFloat(totales) - parseFloat(discount))).toFixed(2));
			if(discount.toFixed(2)>0)
				$('#btn_descuento').html('DESC  $'+discount.toFixed(2));
			else
				$('#btn_descuento').html('DESCUENTO');
			$('#msjDescuentoError').html('');
			$('#btn_descuento').effect('highlight',{},'normal');
		}else{
			$('#msjDescuentoError').html('El descuento no puede ser mayor a '+ totalmiFactura.toFixed(2));
			$('#addDiscount').html('0');
		}
	}
}

function showPopup(){
	$('#popupDiscount').modal("show");
	if($('#descuentoFactura').val()!=''&&parseFloat($('#descuentoFactura').val())>0)
		$('.cantidadd').html(parseFloat($('#descuentoFactura').val()).toFixed(2));
	else
		$('.cantidadd').html('0');
}
	
function closePopup(){
	$('#popupDiscount').modal("hide");
	$('#msjDescuentoError').html('');
}
	
function closePopup2(){
	$('#popupCantidad').modal("hide");
}
	
function borrarCompra(item){
	//variables facturacion
	var subtotalSinIva = $('#subtotalSinIva').val();
	var subtotalIva = $('#subtotalIva').val();
	
	//variables compra
	var total = 0;
	var sumTotal = 0;
	var taxTotal = 0;
	var sumTotal = 0;
	var subtotalSinIvaCompra = 0;
	var subtotalIvaCompra = 0; 
	var productoCantidad = $(item).data('borrarcantidad');
	var productoImpuestos = $(item).data('borrarimpuesto');
	var productoImpuestosIndexes = $(item).data('borrarimpuestoindexes');
	var productoPrecio = $(item).data('borrarprecio');
	var productoAgregados = $(item).attr('data-agregados');
	var idiva=$('#idiva').html();
	
	$(item).closest('tr').remove();
	
	//impuestos start
	if($.trim(productoImpuestosIndexes) != '' && $.trim(productoImpuestosIndexes) != 0){
		if($.trim(productoImpuestosIndexes).indexOf('@') !== -1){
			$.each(productoImpuestosIndexes.split('@'), function(index,value){
				
				if(productoImpuestosIndexes.indexOf(idiva) !== -1){
					subtotalIvaCompra = (parseFloat(productoCantidad) *(parseFloat(productoPrecio)+parseFloat(productoAgregados)));
					}
				else{
					subtotalSinIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+parseFloat(productoAgregados)));
					}
					
				var impuestoDetalles = $('#impuesto-'+ value).val().split('|');
				var currentTax = $('#impuestoFactura-'+ value).val();
				taxTotal = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+productoAgregados) * parseFloat(impuestoDetalles[2]));
				$('#impuestoFactura-'+ value).val(parseFloat(currentTax) - parseFloat(taxTotal));
				});
			}
		else{
			productoImpuestosIndexes == parseInt(idiva) ? subtotalIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+parseFloat(productoAgregados))) : subtotalSinIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+parseFloat(productoAgregados)));

			var impuestoDetalles = $('#impuesto-'+ productoImpuestosIndexes).val().split('|');
			var currentTax = $('#impuestoFactura-'+ productoImpuestosIndexes).val();
			taxTotal = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+parseFloat(productoAgregados)) * parseFloat(impuestoDetalles[2]));
			$('#impuestoFactura-'+ productoImpuestosIndexes).val(parseFloat(currentTax) - parseFloat(taxTotal));
			}
		}else{
			subtotalSinIvaCompra = (parseFloat(productoCantidad) * (parseFloat(productoPrecio)+parseFloat(productoAgregados)));
		}
	//impuestos end
	
	$('.totales').each(function(){
		sumTotal += parseFloat($.trim($(this).val()));
		});
	
	var sumcantidadComandada = 0;
	//alert($('.cantidadproductoscomandados').length)
	$('.cantidadproductoscomandados').each(function(){
		sumcantidadComandada += parseFloat($.trim($(this).val()));
	});
	console.log('los items facturados son'+sumcantidadComandada);
	$('#itemsVendidos').html(sumcantidadComandada);
	/*$('#itemsVendidos').css('display','block');
	$('#itemsVendidos').css('background-color','red');*/
	
	$('#totalmiFactura').val(sumTotal);
	$('#total').html('$'+ parseFloat(sumTotal).toFixed(2));
	$('#payButton').html('PAGAR $'+ parseFloat(sumTotal).toFixed(2));
	$('#subtotalSinIva').val(parseFloat(subtotalSinIva) - parseFloat(subtotalSinIvaCompra));
	$('#subtotalIva').val(parseFloat(subtotalIva) - parseFloat(subtotalIvaCompra));
	$('#justo').html(sumTotal.toFixed(2));
	$('#justo').attr('data-value',-1*sumTotal.toFixed(2));
	$('#redondeado').html(Math.ceil(sumTotal).toFixed(2));
	$('#redondeado').attr('data-value',-1*Math.ceil(sumTotal).toFixed(2));
	$('#payButton').html('PAGAR $'+sumTotal.toFixed(2));
	$('.product_del').on('click',function(){
			PlaySound(4);
	});
}
	
function intOrFloat(e,value){
    if(value.indexOf('.') !== -1 && (e.keyCode == 190 || e.keyCode == 110)){
        e.preventDefault(); 
        }
    
    if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 46 || e.keyCode == 190 || e.keyCode == 110){
        return;
        } 
    else{
        e.preventDefault();
        }
}

var celdaenfocada=-1;
function BuscarSugerencias(filtro,e){
	//alert(e.keyCode);
	if(e.keyCode==13){
		var misugerencias=document.getElementsByClassName('sugerencia');
		for(j=0;j<misugerencias.length;j++){
			if(misugerencias[j].getAttribute('enfocada')==1){
				misugerencias[j].firstChild.click();
			}	
		}
		
	}else if(e.keyCode==38){
		if(document.getElementById('tableresults')){
			$('.sugerencia').each(function(){
				AclararSugerencia($(this)[0],false);
			});
			
			if((celdaenfocada-1)>-1)
				celdaenfocada-=1;
			else
				celdaenfocada=0;
			console.log(celdaenfocada);
			AclararSugerencia(document.getElementById('tableresults').rows[celdaenfocada].cells[0],true);
		}
	}else if(e.keyCode==40){
		$('.sugerencia').each(function(){
				AclararSugerencia($(this)[0],false);
			});
		console.log(e.keyCode);
		if((celdaenfocada+1)<document.getElementById('tableresults').rows.length)
				celdaenfocada+=1;
			console.log(celdaenfocada);
			AclararSugerencia(document.getElementById('tableresults').rows[celdaenfocada].cells[0],true);
	}else{
		if(filtro!=''){
			$('#resultBuscador').fadeIn('slow');
			$('#tableresults').html('');
			var json = $('#jsonProductos').html();
			var mijson = eval(''+json+'');
			
			for(var j in mijson){
				for(var k in mijson[j]){
					for(i = 0; i < mijson[j][k].length; i++){
						
							var item = mijson[j][k][i];
							var suger='';
							if(item.formulado_nombre.toLowerCase().indexOf(filtro.toLowerCase())>-1)
								suger=item.formulado_nombre;
							else if(item.formulado_codigo.toLowerCase().indexOf(filtro.toLowerCase())>-1)
								suger=item.formulado_codigo;
							
							if(suger!='')
							{
								if(document.getElementById('tableresults').rows.length<4){
									$('#tableresults').append("<tr><td class='sugerencia' onmousenter='AclararSugerencia(this,true);' onmouseout='AclararSugerencia(this,false);' enfocada='0'><div id='busc_"+ item.formulado_id +"' data-precio='"+ item.formulado_precio +"' data-impuestos='"+ item.formulado_impuestos +"' data-impuestosindexes='"+ item.formulado_tax_id +"' data-formulado='"+ item.formulado_nombre.toUpperCase()+"' ontap='VerificarAgregados(this,2); return false;'>"+suger.toUpperCase()+"</div></td></tr>");
								}
								
							}
					}
				}
			}
			if(mijson.length>0){
				AclararSugerencia(document.getElementById('tableresults').rows[0].cells[0],true);
			}
		}
	}
}


function AclararSugerencia(celda,focus){
	if(focus){
		celda.style.backgroundColor='rgba(88,88,91,0.9)';
		celda.style.color='#FFF';
		celda.setAttribute('enfocada','1');
	}else{
		celda.style.backgroundColor='transparent';
		celda.style.color='#404041';
		celda.setAttribute('enfocada','0');
	}
}

function PlaySound(id) {
  var thissound=document.getElementById("beep1");
  thissound.play();
}

function DetalleArriba(){
	var actual=parseInt($('#tablaCompra').css('top'));
	var alto=parseInt($('#tablaCompra').css('height'));
	if((actual-5)>=(-alto+25))
	    $('#tablaCompra').css('top',actual-5);
	else
		$('#tablaCompra').css('top',-alto+25);
}

function DetalleAbajo(){
	var actual=parseInt($('#tablaCompra').css('top'));
	if((actual+5)<=0)
	    $('#tablaCompra').css('top',actual+5);
	else
		$('#tablaCompra').css('top',0);
	
	//setTimeout(function(){DetalleAbajo()},200);
}

function AntesDePagar(){
	//$('#paymentModule').modal('show');
	if(parseFloat($('#total').html().substring(1))>0){
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		//$('#paymentEfectivo').val($('#total').html().substring(1));
		//$('#simple_1').html($('#total').html().substring(1));
		//changePaymentCategory('1','Efectivo');
		$('#justo').click();
		$('#paymentModule').slideDown();
		$('#cedulaP').val('9999999999999');
		BuscarCliente(13);
		//$("#cuadroClientes").css('display','none');
		$("#cuadroClientes,#opaco").css("display","none");
		pagar();
		if($('#idCliente').val!=''){
		}else{
			alert("Por favor elija primero un cliente.");
		}
	}
	
}

function soloNumerost(e){
	//console.log(e.keyCode);
	key = e.keyCode || e.which;
	tecla = String.fromCharCode(key).toLowerCase();
	letras = "0123456789.";
	especiales = [8,9,37,39,52];
	tecla_especial = false
	for(var i in especiales){
	    if(key == especiales[i]){
		tecla_especial = true;
		break;
            }
	}
        if(letras.indexOf(tecla)==-1 && !tecla_especial){
	    return false;
	}
}

function ColocarFormasPago(){
	var formaspago=$('#jsonformaspago').html();
	var evalJson=JSON.parse(formaspago);
	//console.log(evalJson);
	for(var k in evalJson){
		var x = 1;
		var mihtml='';
		for(var j in evalJson[k]){
			//alert(evalJson[k][j]+id);
				mihtml+= '<tr>';
				mihtml+= '<td class="columna1">';
				mihtml+= '<div id="paymentCategory-'+evalJson[k][j].id+'" class="paymentCategories" onclick="changePaymentCategory(\''+evalJson[k][j].id+'\',\''+evalJson[k][j].imagen+'\'); return false;" style="height:100%; background-color: #D2D2D2; border-radius:5px; border: 1px solid #cccccc;">';
				mihtml+= '<table style="width: 100%; height: 100%;" cellspacing="0px" cellpadding="0px">';
			    mihtml+= '<tr style="cursor:pointer;">';
				mihtml+= '<td style="width:10%; height:100% text-align: right; font-size: 12px; font-weight:400; padding-left:10px;"><span class="glyphicon glyphicon-ok-circle"></span></td>';
				mihtml+= '<td class="textoformapago" id="forma_'+evalJson[k][j].id+'">';
				mihtml+=evalJson[k][j].nombre;
				mihtml+= '</td><td class="simple" id="simple_'+evalJson[k][j].id+'" style="text-align:right; padding-right:10px; display:none;">0.00</td>';
				mihtml+= '</tr>';
				mihtml+= '</table>';
				mihtml+= '</div>';
				mihtml+= '</td>';
				mihtml+= '<td class="columna2" style="display:none;">';
				var read='';
				var fondo='transparent';
				var inputfondo='#F7F7F7';
				if(evalJson[k][j].id!=1){
					read='readonly';
					fondo='#DDD';
					inputfondo='#DDD;'
				}
					
				mihtml+= '<div style="height:100%; background-color:'+inputfondo+'; border:1px solid #CCCCCC; text-align:center; padding-right:10px;">';
				mihtml+= '<input class="paymentMethods" paymentMethod="'+evalJson[k][j].nombre+'" idPaymentMethod="'+evalJson[k][j].id+'" id="payment'+evalJson[k][j].nombre.replace(" ","")+'" style="height:100%; width:100%; background:'+fondo+'; border:0px; text-align:right;" placeholder="0.00" value="" onclick="CambiarMetodo('+"'"+evalJson[k][j].nombre.replace(" ","")+"'"+');" type="number" min="0.00" step="0.10" onfocus="this+select();" onchange="CambiarMetodo('+"'"+evalJson[k][j].nombre.replace(" ","")+"'"+');" onkeypress="isalphanumeric(event);" '+read+' />';
				mihtml+= '</div>';
				mihtml+= '</td><td width="5%" class="basurero" style="display:none; "><button class="btn" type="button" onclick="ResetPagos('+evalJson[k][j].id+');"><span class="glyphicon glyphicon-trash"></span></button></td>';
				mihtml+= '</tr>';
				x++;
		}
	}
	$('#tablaformaspago').html(mihtml);
}

function BuscarCliente(e){
	var valor=$('#cedulaP').val();
	if(e==13){
		mostrarClientes();
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
	}
}
function Init3(){
	//console.log("celular pequeno");
	mialtoboton=0;
		var w=$(window).width();
		$('.producto,.categoriaActiva,.categoria').each(function(){
		//console.log($(this));
		$(this).css('width',(w/3.7)+'px');
		if ($(this).height()>mialtoboton){
			mialtoboton=$(this).height();
		}
	});

	//pongo alto uniforme al mas grande.
	$('.producto').each(function(){
		$(this).css('height',mialtoboton+'px');
	});
	
	
	var anchoCategorias=0;
	var cuantas=0;
	$('.esCategoria').each(function(){
		anchoCategorias+=parseFloat($(this).css('width'));
		cuantas++;
	});
	var anchodireccionales=parseInt($('.direccionales').css('width'));
	$('#nav_izq,#nav_der').css('width',anchodireccionales);
	var wp=parseInt($('.productos').css('width'))-40;
	
	if(anchoCategorias<wp)
		$('#contenidoCategorias').css('width','100%');
	else
		$('#contenidoCategorias').css('width',(anchoCategorias+cuantas));

	if(anchoCategorias<wp){
		$('.direccionales').css('display','none');
		$('#listaCategorias').css('width','100%');
		}
	else{
		$('.direccionales').css('display','block');
		$('#listaCategorias').css('width',((wp)-(2*anchodireccionales)-10)+'px');
		}
	$('.direccionales').css('height',(parseInt($('#listaCategorias').css('height')))+'px');
	$('.direccionales').css('width','100%');
	
	$('#avisadorpeque').show();
	
}

function Init31(){
	var h=$(window).height();
	var w=$(window).width();
	var hd=$(document).height();
	if(h/w>=0.725) vertical=true;
	else vertical=false;
	$('#main').height(h-parseFloat($('.navbar').css('height')));
	$('#main').width(w*98/100);
	$('#contentdetalle').css("height",(3*h/5));
	var navh=parseInt($('.navbar').css("height"));
	$('#pay').css("height",(hd-navh));
	if(w<600){
		$('.btn-lg').each(function(){
			var actual=$(this).attr('class');
			var nueva=actual.replace("btn-lg","btn-sm");
			$(this).attr("class",nueva);
		});
	}else{
		$('.btn-sm').each(function(){
			var actual=$(this).attr('class');
			var nueva=actual.replace("btn-sm","btn-lg");
			$(this).attr("class",nueva);
		});
	}
	
	//$('.producto').css('font-size',(h*2.8/100)+'px');
	$('.producto,.categoriaActiva,.categoria').each(function(){
		//console.log($(this));
		$(this).css('width',w/5.5);
	});
	if(vertical){
		$('.producto').css('height',((h*4.5/100)+15)+'px');
		//$('.producto,.categoriaActiva,.categoria').css('height',((h*4.5/100)+15)+'px');
		//$('#listaProductos').css('height',"100%");
	}else{
		//$('.producto,.categoriaActiva,.categoria').css('height',((h*6.5/100)+15)+'px');
		$('.producto').css('height',((h*6/100)+15)+'px');
		//$('#listaProductos').css('height',"100%");
	}
	$('.den').css('height',2*parseFloat($('.producto').css('height')));
	$('.den').css('width',2*parseFloat($('.producto').css('height')));
	$('.den').css('font-size','14px');
	$('#productos').css('height',h-parseFloat($('.navbar').css('height'))-parseFloat($('#listaCategorias').css('height'))-20);
	
	/*if(h<600)
		$('#listaProductos').css("min-height","480px");*/
	
	//$('#listaCategorias').css('height',(parseInt($('.categoria').css('height')))+'px');
	$('#listaProductos').css('height',(parseInt($('.productos').css('height'))-parseInt($('#listaCategorias').css('height'))+'px'));
	$('.direccionales').css('height',(parseInt($('#listaCategorias').css('height')))+'px');
	//$('.direccionales').css('width',(parseInt($('.direccionales').css('width')))+'px');
	$('.direccionales').css('width','100%');
	var anchoCategorias=0;
	var cuantas=0;
	$('.esCategoria').each(function(){
		anchoCategorias+=parseFloat($(this).css('width'));
		cuantas++;
	});
	var anchodireccionales=parseInt($('.direccionales').css('width'));
	$('#nav_izq,#nav_der').css('width',anchodireccionales);
	//$('#listaCategorias').css('width',(w-(2*anchodireccionales)-30)+'px');
	//$('#listaCategorias').css('height',$('.producto').css('height'));
	//$('#contenidoCategorias').css('width',anchoCategorias+20);
	var wp=parseInt($('.productos').css('width'))-40;
	//alert(anchoCategorias+'/'+wp);
	
	if(anchoCategorias<wp)
		$('#contenidoCategorias').css('width','100%');
	else
		$('#contenidoCategorias').css('width',(anchoCategorias+cuantas));

	if(anchoCategorias<wp){
		$('.direccionales').css('display','none');
		//$('#listaCategorias').css('width',wp);
		$('#listaCategorias').css('width','100%');
		}
	else{
		$('.direccionales').css('display','block');
		$('#listaCategorias').css('width',((wp)-(2*anchodireccionales)-10)+'px');
		}
	//alert('init');
}

$(document).ready(function(){
	Ready();
});

$(window).resize(function(){
    botonesCalculadora();
});

function botonesCalculadora(){
    height=($(window).height() * 0.70) / 4 ;
    heightc=($(window).height() * 0.45) / 4 ;
    $(".numero").css("height", height +"px");
    $(".numeroc").css("height", heightc +"px");
}

function ClickNumero(num){
	var accion = $.trim($(num).attr('cual'));
    cantidad=$.trim($('.cantidad').html());


        if(accion=='.')        return; 

        if(cantidad=='0'){
            $('.cantidad').html('0.00'); 
            cantidad='0.00';    
        } 
        console.log(accion);
        expAction=cantidad.split(".");

       if(accion=='+'){
            // $("#inputbusc").focus();
            currentAction='+';
			vecesEnCantidad=0;
			var codigoBusqueda = $('.cantidad').html();
			var entero = codigoBusqueda.replace(".","");
			var primerDigito = entero.substring(0,1);
			var segundoDigito = entero.substring(1,2);
			var tercerDigito = entero.substring(2,3);
			var esConfirm = false;
			if(entero.length == 3){
				if(primerDigito == 0 && segundoDigito == 0){
					sumaDigitos = tercerDigito;
					if(confirm('su codigo es : ' + sumaDigitos+'?')){
						codigoBusqueda = tercerDigito;
						esConfirm = true;
						saberProducto(codigoBusqueda,currentCantidad);
						//agregarCompra(codigoBusqueda);
						$('.cantidad').html('');
						
					}
				}
				
				if(primerDigito == 0 && segundoDigito != 0){
					sumaDigitos = (segundoDigito+''+tercerDigito);
					if(confirm('su codigo es : ' + sumaDigitos+'?')){
						codigoBusqueda = sumaDigitos;
						esConfirm = true;
						saberProducto(codigoBusqueda,currentCantidad);
						//agregarCompra(codigoBusqueda);
						$('.cantidad').html('');
					}
				}
				if(primerDigito != 0){
					sumaDigitos = entero;
					if(confirm('su codigo es : ' + sumaDigitos+'?')){
						codigoBusqueda = sumaDigitos;
						esConfirm = true;
						saberProducto(codigoBusqueda,currentCantidad);
						
						//agregarCompra(codigoBusqueda);
						$('.cantidad').html('');
					}
				}
				//alert(sumaDigitos);
				
			}
			
			$('.cantidad').html('0.00');
			if(esConfirm == false){
				sumaDigitos = entero;
				saberProducto(sumaDigitos , currentCantidad);
				$('.cantidad').html('');
				//alert(sumaDigitos);
				//agregarCompra(sumaDigitos);
				
			}
			$('.cantidad').html('0.00');
        }

        if(accion=='-'){
	//alert(vecesEnCantidad);
            vecesEnCantidad++;
            
            if(vecesEnCantidad==2){
                accion='go';
                
            }else{
                
                currentCantidad=$('.cantidad').html();
                $('.cantidad').html('0.00');
                return;    
            }
            
        }


        if(accion=='go'){
            if(vecesEnCantidad==0){
                
                cantidadMultiplicar=$('.cantidad').html();
                currentCantidad=1;
                AgregarProductoCustom(1,cantidadMultiplicar);
                //alert("here");
            }else{
                cantidadMultiplicar=$('.cantidad').html();
                valorProducto=cantidadMultiplicar * currentCantidad;
                AgregarProductoCustom(valorProducto , valorProducto);

                vecesEnCantidad=0;    
            }
            
            return;
        }
    


        if(accion=='d'){

            if(expAction[0].length > 1 && expAction[1]=='00' ){
                leftPart=expAction[0].substring(0,expAction[0].length-1);
                leftPart2=expAction[0].substring(expAction[0].length-1,expAction[0].length);
                $('.cantidad').html(leftPart+'.'+leftPart2+'0');
                return;
            }else{
                if(expAction[0].length == 1 && expAction[1]=='00' ){
                    leftPart=expAction[0].substring(0,expAction[0].length-1);
                    leftPart2=expAction[0].substring(expAction[0].length-1,expAction[0].length);
                    $('.cantidad').html('0.'+leftPart2+''+0);
                    return;
                }

                if(expAction[0] == '0' && expAction[1]!='00' ){
                        rightPart=expAction[1].substring(0,1);
                        $('.cantidad').html('0.0'+rightPart);
                }

                if(expAction[0] != '0' && expAction[1]!='00' ){
                        leftPart=expAction[0].substring(0,expAction[0].length-1);
                        leftPart2=expAction[0].substring(expAction[0].length-1,expAction[0].length);
                        rightPart=expAction[1].substring(0,1);
                        $('.cantidad').html(leftPart + '.'+  leftPart2 +'' + rightPart);
                }

                
            }

            if(cantidad=='0.00'){
                /*no borrar nada*/
            }else{
                if(expAction[1].substring(1,2)!='0' && expAction[1].substring(0,1)=='0' && expAction[0]=='0' ){
                    /*0.0N*/
                    goRight=expAction[1].substring(0,1);
                    $('.cantidad').html('0.00');
                }else{
                    /* 0.NE*/
                    if(expAction[1].substring(1,2)!='0' && expAction[1].substring(0,1)!='0' && expAction[0]=='0' ){
                        lastNumber=expAction[1].substring(0,1);
                        newRight='0'+lastNumber;
                        $('.cantidad').html('0.'+newRight);    
                    }else{
                        if(expAction[1].substring(1,2)!='0'  && expAction[0]!='0' ){
                            lenLeft=expAction[0].length;
                            if(lenLeft==1){
                                lastNumberLeft=expAction[0].substring(0,1);
                                lastNumberRight=expAction[1].substring(0,1);
                                newRight=lastNumberLeft+''+lastNumberRight;
                                newLeft='0';
                                newCantidad=newLeft+'.'+newRight;
                                $('.cantidad').html(newCantidad);    
                            }else{
                                lastNumberLeft=expAction[0].substring(lenLeft-1,lenLeft);
                                lastNumberRight=expAction[1].substring(0,1);
                                newRight=lastNumberLeft+''+lastNumberRight;
                                newLeft=expAction[0].substring(0,expAction[0].length-1);
                                $('.cantidad').html(newLeft + "."+newRight);    

                            }
                        }else{

                        }
                    }
                }
            }
            return;
        }

        if(cantidad=='0.00'){ /*0.00*/
            if(accion=='00'){
                $('.cantidad').html('0.'+accion);
            }else{
                $('.cantidad').html('0.0'+accion);    
            }
            
        }else{
            if(expAction[1].substring(0,1)=='0' && expAction[0]=='0'){  /*0.0N*/
                lastNumber=expAction[1].substring(1,2);
                if(accion=='00'){
                    $('.cantidad').html(lastNumber+'.'+accion);
                }else{
                    $('.cantidad').html('0.'+lastNumber+''+accion);    
                }
                
            }else{
                if(expAction[0].substring(0,1)=='0' && expAction[1]!='00' ){ /*0.NE*/
                    lastNumber=expAction[1].substring(0,1);
                    lastNumber2=expAction[1].substring(1,2);
                    newNumber=lastNumber+'.'+lastNumber2 + '' +accion;
                    if(accion=='00'){
                        newNumber=lastNumber+''+lastNumber2 + '.' +accion;
                        $('.cantidad').html(newNumber);
                    }else{
                        $('.cantidad').html(newNumber);
                    }
                    
                }else{
                    exp1=expAction[0];
                    exp2=expAction[1];
                    lastNumber=expAction[1].substring(0,1);
                    rightNew=exp2.substring(1,exp2.length) + '' +accion;
                    newLeft=exp1 + "" + lastNumber;

                    if(accion=='00' && expAction[1]=='00'){
                        $('.cantidad').html(expAction[0] + '00.00');
                    }else{
                        $('.cantidad').html(newLeft + '.'+rightNew);
                    }
                    
                }
            }
        }
}

function ClickNumeroC(numc){
	var accion = $.trim($(numc).attr('cual'));
		console.log(accion);
		if(accion == 'p'){
			if($('.cantidad').html().indexOf('.') == -1){
				if($('.cantidad').html() == '0'){
					$('.cantidad').append('.');
					}
				else{
					$('.cantidad').append('.');
					}
				}
			return false;
			}
		else if($.isNumeric(accion) === true){
			if($('.cantidad').html()=='0')
					$('.cantidad').html(accion);
			else
					$('.cantidad').append(accion);
			return false;
			}
			
		var fetchHTML = $.trim($('.cantidad').html());
		$('.cantidad').html(fetchHTML.substring(0,(fetchHTML.length-1)));
		if($('.cantidad').html()=='')
			$('.cantidad').html('0');
}

function ClickNumeroD(numd){
	var accion = $.trim($(numd).attr('cual'));
		console.log(accion);
		if(accion == 'p'){
			if($('.cantidadd').html().indexOf('.') == -1){
				if($('.cantidadd').html() == '0'){
					$('.cantidadd').append('.');
					}
				else{
					$('.cantidadd').append('.');
					}
				}
			return false;
			}
		else if($.isNumeric(accion) === true){
			if($('.cantidadd').html()=='0')
					$('.cantidadd').html(accion);
			else
					$('.cantidadd').append(accion);
			return false;
			}
			
		var fetchHTML = $.trim($('.cantidadd').html());
		$('.cantidadd').html(fetchHTML.substring(0,(fetchHTML.length-1)));
		if($('.cantidadd').html()=='')
			$('.cantidadd').html('0');
}

function Ready(){
	
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(function(tx){
		tx.executeSql('SELECT * FROM IMPUESTOS',[],function(tx,results){
			for(var r=0;r<results.rows.length;r++){
				var itemi=results.rows.item(r);
				if($.trim(itemi.nombre.toLowerCase())=='iva')
					$('#idiva').html(itemi.timespan);
				
				if($('#impuesto-'+itemi.timespan).length==0){
					$('#taxes').append('<input id="impuesto-'+itemi.timespan+'" type="text" value="'+itemi.timespan+"|"+itemi.nombre+"|"+parseFloat((itemi.porcentaje)/100)+'">');
				}else{
					$("impuesto-"+itemi.timespan).val(itemi.timespan+"|"+itemi.nombre+"|"+parseFloat((itemi.porcentaje)/100))
				}
			}
			
		});
	},errorCB,successCB);
	
	if($(window).height()>500){
			Init31();
		}
		else{
			Init3();
		}
    botonesCalculadora();
	ColocarFormasPago();
	if(localStorage.getItem("diseno")==0||localStorage.getItem("diseno")==null||localStorage.getItem("diseno")==""){
		formarCategorias();
	}else{
		formarCategoriasMenu();
	}
	
    $('.numero').on('click',function(){ClickNumero($(this));});
	$('.numeroc').on('click',function(){ClickNumeroC($(this));});
	$('.numerod').on('click',function(){ClickNumeroD($(this));});
	vertarjetas();
}

	function saberProducto(id , currentCantidad){
			
			var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
			db.transaction(function(tx){
				tx.executeSql('SELECT COUNT(codigo) as cuantos FROM PRODUCTOS WHERE codigo='+id+';',[],function(tx,res){
					var existen=res.rows.item(0).cuantos;
					if(existen==0){
						alert('no existe ese producto');
						$('.cantidad').html('0.00');
					}else{
						$('.cantidad').html('0.00');
						//alert('hola')
						tx.executeSql('SELECT * FROM PRODUCTOS WHERE codigo='+id+';',[],function(tx,result){
							//alert(result);
							for (var i=0; i <= result.rows.length-1; i++){
								var row = result.rows.item(i);
								var productoNombre = row.formulado;
								var productoCantidad = 1;
								var cargaiva = row.cargaiva;
								var productoImpuestosIndexes = cargaiva;
								if(cargaiva == 1){
									var productoImpuestos = 0.12;
								}
								else{
									var productoImpuestos = 0;
								}
								var productoPrecio = row.precio;
								var total = ((parseFloat(productoPrecio) * parseFloat(productoImpuestos))+parseFloat(productoPrecio));
								console.log(productoPrecio);
								var productoID = row.id_local;
								//console.log(formulado);
								var taxTotal = 1;
								var sumTotal;
								 $('.cantidad').html('0.00')
									$("#createHereCustomProduct").html('\
										<div id="elProductoCustom" style="display:none;background-color:null; border:1px solid null" id="-1" data-precio="'+total+'" data-impuestos="" data-impuestosindexes="" data-id_local="'+row.id_local+'"  data-formulado="'+productoNombre+'" onclick="agregarCompra(this); return false;" class="producto btn btn-lg btn-primary categoria_producto_-1">'+productoNombre+'</div>\
										<script>$("#elProductoCustom").click();</script>\
									');
									//currentCantidad = 0;
							}
						},errorCB,successCB);
						
					}
				},errorCB,successCB);
			});
	}

	function BuscarSugerencias2(filtro,e){
		
		var buscar = $('#inputbusc').val();
		//alert(buscar);
		
		var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
		db.transaction(function(tx){
			tx.executeSql("SELECT * FROM PRODUCTOS WHERE formulado like '%"+buscar+"%' and productofinal=1 and estado=1",[],function(tx,results){
				//console.log(results);
				if(results.rows.length>0){
					var res1=new Object();
					for(var n=0;n<results.rows.length;n++){
						var itemr=results.rows.item(n);
						//console.log(itemr);
						var productodata=new Object();
						productodata.id_local=itemr.id_local;
						productodata.formulado=itemr.formulado;
						productodata.codigo=itemr.codigo;
						productodata.precio=itemr.precio;
						productodata.id=itemr.timespan;
						productodata.categoria=itemr.categoriaid;
						cadimpuestos='';
						cadimpuestosid='';
						if(itemr.cargaiva==1){
							cadimpuestos='0.12';
							cadimpuestosid='1';
						}
						
						if(itemr.servicio==1){
							if(cadimpuestos!=''){
									cadimpuestos+='@';
									cadimpuestosid+='@';
							}
							cadimpuestos+='0.10';
							cadimpuestosid+='2';
						}
						
						productodata.formulado_impuestos=cadimpuestos;
						productodata.formulado_tax_id=cadimpuestosid;
						res1[n]=productodata;
					}
					/*var productodata=new Array();
					productodata.formulado = results.rows.item(0);
					var id = row.id*/
					$('#jsonproductos').html(JSON.stringify(res1));
					//console.log(res1);
					
				}
			},errorCB,successCB);
		});
			if(filtro!=''){
				$('#resultBuscador').fadeIn('slow');
				$('#tableresults').html('');
				var jsonf = $('#jsonproductos').html().toString();
				console.log(jsonf);
				var mijson = JSON.parse(jsonf);
				console.log(mijson);
				for(var j in mijson){
					var item = mijson[j];
					var suger='';
					if(item.formulado.toLowerCase().indexOf(filtro.toLowerCase())>-1)
						suger=item.formulado;
					else if(item.codigo.toLowerCase().indexOf(filtro.toLowerCase())>-1)
						suger=item.codigo;
								
					if(suger!='')
					{
						if(document.getElementById('tableresults').rows.length<4){
						$('#tableresults').append("<tr id='busc_"+ item.id +"' data-id_local = '"+item.id_local+"' data-precio='"+ item.precio +"' data-impuestos='"+ item.formulado_impuestos +"' data-impuestosindexes='"+ item.formulado_tax_id +"' data-formulado='"+ item.formulado+"'><td class='sugerencia' enfocada='0'><div id='busc_"+ item.id +"' data-precio='"+ item.precio +"' data-impuestos='"+ item.formulado_impuestos +"' data-impuestosindexes='"+ item.formulado_tax_id +"' data-formulado='"+ item.formulado+"' data-id_local = '"+item.id_local+"' onclick='VerificarAgregados(this,2)'>"+suger.toUpperCase()+"</div></td></tr>");
						}
									
					}
					
				}
				/*if(document.getElementById('tableresults').rows[0]!=null){
					AclararSugerencia(document.getElementById('tableresults').rows[0].cells[0],true);
				}*/
			}
		/*}*/
	}
	

function subirefectivo(boton){
	
	$('#paymentEfectivo').val('0.00');
	var valor=$(boton).attr('data-value');
	//console.log(valor);
	valor=parseFloat(valor);
	var cuantohay=0;
	if($('#paymentEfectivo').val()=='')
		cuantohay=0;
	else
		cuantohay=parseFloat($('#paymentEfectivo').val());
	
	var newvalor=0;
	if(valor>0)
		newvalor=valor+cuantohay;
	else{
		if(valor==-0)
			newvalor=0;
		else
			newvalor=-1*valor;
	}
	console.log(newvalor);
	$('#paymentEfectivo').val(newvalor.toFixed(2));
	$('#paymentEfectivo').change();
}

function vertarjetas(){
	var tarjetas=$('#jsontarjetas').html();
	var evalJson=JSON.parse(tarjetas);
	//console.log(evalJson);
	for(var k in evalJson){
		var x = 1;
		var mihtml='';
		for(var j in evalJson[k]){
			var dat=evalJson[k][j];
			var div='<div class="col-xs-3"><button data-value="0.00" type="button" class="btn btn-primary btn-lg card" id="card_'+dat.id+'" data-id="'+dat.id+'" onclick="elegirTarjeta('+dat.id+');"><span>'+dat.nombre+'</span><span style="position:absolute; right:5px; top:3px; font-size:10px;" class="cardv" id="cardv_'+dat.id+'"></span></button></div>';
			$('#lastarjetas').append(div);
			x++;
		}
	}
}

function elegirTarjeta(id){
	
	if(pagonormal){
		$('.cardv').html('');
		$('.card').attr("data-value","0");
		$('#paymentTarjetas').val("0");
	}
	
	var clase=$('.card').attr('class');
	clase=clase.replace('btn-success','btn-primary');
	$('.card').attr('class',clase);
	clase=clase.replace('btn-primary','btn-success');
	$('#card_'+id).attr('class',clase);
	
	if($('#cardv_'+id).html()!=''){
		$('#cardv_'+id).html('');
		$('#card_'+id).attr('data-value','0');
		var clase=$('#card_'+id).attr('class');
		clase=clase.replace('btn-success','btn-primary');
		$('#card_'+id).attr('class',clase);
		$('#cardgroup').css("display","none");
	}
		
	
	var suma=0;
	$('.card').each(function(){
		if($(this).attr('id')!='card_'+id)
			suma+=parseFloat($(this).attr('data-value'));
	});
	
	console.log('antes'+suma);
	var valorfalta=0;
	//var pagado=parseFloat($('#invoicePaid').html());
	var pagado=0;
	$('.paymentMethods').each(function(){
		if($(this).val()!='')
			pagado+=parseFloat($(this).val());
	});
	
	var mitot=parseFloat($('#invoiceTotal').html());
	console.log("falta:"+(mitot-pagado));
	if((mitot-pagado)<0)
		valorfalta=0;
	else
		valorfalta=mitot-pagado;
	
	console.log("falta:"+mitot+'/'+pagado+'/'+valorfalta);
	if(valorfalta>0){
		$('#valortarjeta').val(valorfalta.toFixed(2));
		$('#card_'+id).attr('data-value',valorfalta.toFixed(2));
	}else{
		$('#valortarjeta').val("0.00");
		$('#card_'+id).attr('data-value',"0");
	}
	
	//alert("hola");
	/*$('#valortarjeta').val(parseFloat($('#card_'+id).attr('data-value')).toFixed(2));*/
	
	if($('#cardv_'+id).html()==''){
		if(parseFloat($('#valortarjeta').val())>0){
			$('#cardv_'+id).html(' ('+$('#valortarjeta').val()+')');
			$('#cardgroup').fadeIn();
		}
		else
			$('#cardv_'+id).html('');
	}
		
	
	var suma=0;
	$('.card').each(function(){
		suma+=parseFloat($(this).attr('data-value'));
	});
	
	$('#paymentTarjetas').val((suma).toFixed(2));
	$('#simple_2').html((suma).toFixed(2));
	changePaymentCategory('2','Tarjetas');
	
}

function valorcardchange(){
	$('.card').each(function(){
		if($(this).hasClass('btn-success')){
			var elid=$(this).attr('data-id');
			if(parseFloat($('#valortarjeta').val())>0){
				$('#card_'+elid).attr('data-value',$('#valortarjeta').val());
				$('#cardv_'+elid).html(' ('+$('#valortarjeta').val()+')');
			}
			else{
				$('#cardv_'+elid).html('');
				$('#card_'+elid).attr('data-value','0');
			}
		}
	});
	var suma=0;
	$('.card').each(function(){
		suma+=parseFloat($(this).attr('data-value'));
	});
	$('#paymentTarjetas').val(suma.toFixed(2));
	changePaymentCategory('2','Tarjetas');
}

function valorchequechange(){
	//console.log('Anachwque');
	var suma=0;
	$('.cheque').each(function(){
		//console.log("Ana"+$(this).val());
		if($(this).val()!=null)
			suma+=parseFloat($(this).val());
	});
	console.log(suma);
	$('#paymentCheques').val(suma.toFixed(2));
	changePaymentCategory('3','Cheques');
}

function valorcxcchange(){
	var valorcxc=parseFloat($('#valorcxc').val());
	if(valorcxc>0){
		$('#paymentCxC').val(valorcxc.toFixed(2));
	}else
		$('#paymentCxC').val(0);
	
	changePaymentCategory('4','CxC');
}

function toogleCalc(){
	$('#pad,#grid').toggle();
	$('#menuproductos,#numpad').toggle('fast');
}

function ResetPagos(cual){
	if(cual==1){
		$('#paymentEfectivo').val('0.00');
		//$('#paymentEfectivo').change();
		//CambiarMetodo('Efectivo');
	}else if(cual==2){
		//console.log('anacard');
		$('.cardv').html('');
		$('.card').attr('data-value','0');
		$('#valortarjeta,#paymentTarjetas').val('0.00');
		//valorcardchange();
	}else if(cual==3){
		$('#valorcheque1,#paymentCheques').val('0.00');
		//valorchequechange();
	}else if(cual==4){
		$('#valorcxc,#paymentCxC').val('0.00');
		//valorcxcchange();
	}
	
	var pagado=0;
	$('.paymentMethods').each(function(){
		if($(this).val()!='')
			pagado+=parseFloat($(this).val());
	});
	
	console.log(pagado);
	
	var mitot=parseFloat($('#invoiceTotal').html());
	$('#invoicePaid').html(pagado.toFixed(2));
	
	var falta=mitot-pagado;
	
	if((mitot-pagado)>0){
		$('#invoiceDebt').html("FALTANTE");
		$('#changeFromPurchase').html(falta.toFixed(2));
	}else if((mitot-pagado)==0){
		$('#invoiceDebt').html("VUELTO");
		$('#changeFromPurchase').html("0.00");
	}else{
		$('#invoiceDebt').html("VUELTO");
		$('#changeFromPurchase').html(falta.toFixed(2));
	}
}


function VerificarNumero(valor){
	//alert(valor);
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	var existe=false;
	var serie='001';
	var establecimiento='001';
	db.transaction(function (tx){
			tx.executeSql('SELECT id from FACTURAS where CAST(aux as integer) = CAST(? as integer)',[valor],
			function(tx,res){
				if(res.rows.length>0){
					console.log(res);
					showalert("Ya existe una factura con ese número.");
					db.transaction(function (tx2){
						tx2.executeSql('SELECT MAX(CAST(aux as integer))+1 as max FROM FACTURAS',[],
						function(tx2,res2){
							var ceros='';
							var coun=0;
							var nfact='1';
							if(res2.rows.length>0){
								coun=res2.rows.item(0).max.toString().length;
								nfact=res2.rows.item(0).max.toString();
							}
							
							var ceroscount=0;
							while(ceroscount<(9-coun)){
								ceros+='0';
								ceroscount++;
							}
							$('#invoiceNr').val(ceros+nfact);
							$('#invoiceNr').effect('highlight',{},'normal');
						});
						
						tx2.executeSql('SELECT serie,establecimiento from config where id=1',[],function(tx2,results){
							var miserie=results.rows.item(0).serie;
							var miestablecimiento=results.rows.item(0).establecimiento;
							var invoicenr=$('#invoiceNr').val();
							$('#invoiceNrComplete').val(miestablecimiento+'-'+miserie+'-'+invoicenr);
						});
					});
				}else{
					$('#invoiceNr').effect('highlight',{},'normal');
					db.transaction(function (tx2){
					tx2.executeSql('SELECT serie,establecimiento from config where id=1',[],function(tx2,results){
							var miserie=results.rows.item(0).serie;
							var miestablecimiento=results.rows.item(0).establecimiento;
							var invoicenr=$('#invoiceNr').val();
							$('#invoiceNrComplete').val(miestablecimiento+'-'+miserie+'-'+invoicenr);
						});
					});
				}
			});
	});
}

function formarCategoriasMenu(){
	var selected = '';
	var categoriaSelected = 0;
	var objcategoria='';
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(function (tx){
		tx.executeSql('SELECT * from MENU_CATEGORIAS where activo="true" order by orden',[],
		function(tx,res){
			if(res.rows.length>0){
				for(m=0;m<res.rows.length;m++){
					selected = 'categoria';
					var row=res.rows.item(m);
					if(m==0){
						selected = 'categoriaActiva';
						categoriaSelected = row.timespan;
					}
					console.log("idcmenu:"+row.timespan);
					$('#listacat').append('<li id="categoria_'+ row.timespan +'" class="esCategoria '+ selected +'" onclick="ActivarCategoriaMenu(this,'+"'"+ row.timespan +"'"+'); PlaySound(5);"><a>'+ (row.nombre).substring(0,20) +'</a></li>');
				}
				objcategoria=$('#categoria_'+categoriaSelected)[0];
				console.log(objcategoria);
				ActivarCategoriaMenu(objcategoria,categoriaSelected);
			}else{
				$("#menuproductos").html("<b>No se ha diseñado el menú todavía.</b>");
			}
		});
	},errorCB,successCB);
}

function ActivarCategoriaMenu(cual,categoria){
	//console.log(categoria);
	$('#category').val(categoria);
	$('#controller').val(1);
	$('.directionProducts').css('display','none');
	$('#listaProductos').html('');
	$('#pager').val('1');
	var fila=cual.parentNode.parentNode;
	var miscateg=fila.getElementsByTagName('li');
	//var tam='btn-lg';
	for(k=0;k<miscateg.length;k++){
		/*tam='btn-lg';
		if($(miscateg[k].hasClass( "btn-xs" )))
			tam='btn-xs';*/
		if(miscateg[k].id!='listaCategorias' && miscateg[k].id!='contenidoCategorias')
			miscateg[k].className="categoria esCategoria ";
	}
	cual.className="categoriaActiva esCategoria active";
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	db.transaction(
	function (tx){
		
		/*impuestos activos */
		tx.executeSql("SELECT * FROM IMPUESTOS WHERE activo=? order by id",["true"],function(tx,results3){
							console.log(results3);
							var impuestos='';
							var impuestosid='';
							if(results3.rows.length>0){
								console.log("encuentra impuestos");
								var cuan=0;
								for(var r=0;r<results3.rows.length;r++){
									var imp=results3.rows.item(r);
									if(cuan>0){
										impuestos+="@";
										impuestosid+="@";
									}
									impuestos+=parseFloat(imp.porcentaje)/100;
									impuestosid+=imp.timespan;
									cuan++;
								}
								console.log(impuestos+'/'+impuestosid);
								$('#impuestosactivos').html(impuestos);
								$('#impuestosactivosid').html(impuestosid);
								}
		});
		/**/
		
		tx.executeSql("SELECT MAX(fila) as max from menu where activo='true'",[],function(tx,res1){
			var maxfilas=0;
			if(res1.rows.length>0){
				if(res1.rows.item(0).max!=null&&res1.rows.item(0).max>0){
					maxfilas=res1.rows.item(0).max;
					for(var r=1;r<=maxfilas;r++){
						
						console.log('SELECT p.*, m.idcatmenu as idc,m.columna as col,m.fila as fila FROM PRODUCTOS p, MENU m WHERE m.idproducto=p.timespan and m.idcatmenu="'+categoria+'" and activo="true" and fila='+m+' ORDER BY m.columna asc');
						tx.executeSql('SELECT p.*, m.idcatmenu as idc,m.columna as col,m.fila as fila FROM PRODUCTOS p, MENU m WHERE m.idproducto=p.timespan and m.idcatmenu="'+categoria+'" and activo="true" and fila='+r+' ORDER BY m.columna asc',[],function(tx,res){
							console.log(res);
							if(res.rows.length>0){
								//alert('prods');
								var t=1;
							var vectorpos=['<div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+categoria+'"></div>','<div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+categoria+'"></div>','<div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+categoria +'"></div>'];
								for(m=0;m<res.rows.length;m++){
									var row=res.rows.item(m);
									if(isNaN(row.precio)){row.precio = 0;}
									var impuestos='';
									var impuestosid='';
									if(row.tieneimpuestos=="true"){
										impuestos=$('#impuestosactivos').html();
										impuestosid=$('#impuestosactivosid').html();
									}
									/*var impuestos='';
									var impuestosid='';
									if(row.cargaiva==1){
										impuestos+='0.12';
										impuestosid+='1';
									}
									if(row.servicio==1){
										if(row.cargaiva==1){
											impuestos+='@';
											impuestosid+='@';
										}
										impuestos+='0.10';
										impuestosid+='2';
									}*/
									var lineHeight='';
									if(row.formulado.length>12)
										lineHeight='line-height:18px;';
									vectorpos[row.col-1]='<div style="background-color:'+row.color+'; border:1px solid '+row.color+'; '+lineHeight+' text-transform:capitalize; " id="'+ row.timespan+'" data-precio="'+ row.precio +'" data-impuestos="'+impuestos +'" data-impuestosindexes="'+impuestosid +'" data-id_local = "'+row.id_local+'" data-formulado="'+ row.formulado +'" onclick="VerificarAgregados(this); return false;" ontap="VerificarAgregados(this); return false;" class="producto btn btn-lg btn-primary categoria_producto_'+row.idc +'">'+ row.formulado +'</div>';
									/*if(row.formulado.length>12)
										lineHeight='line-height:18px;';
									var resto=parseInt(row.col)-t;
									var agregar='';
									
									if($('.producto').length<((parseInt(row.fila)-1)*3)+(parseInt(row.col)-1)){
										//alert('falta');
										agregar+='<div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+row.idc +'"></div>';
									}
									
									//alert(resto);
									if(resto>0){
										for(var s=1;s<=resto;s++){*/
											//agregar+='<div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+row.idc +'"></div>';
										/*}
									}*/
									//$('#listaProductos').append(agregar);
									//$('#listaProductos').append('<div style="background-color:'+row.color+'; border:1px solid '+row.color+'; '+lineHeight+' text-transform:capitalize; " id="'+ row.timespan+'" data-precio="'+ row.precio +'" data-impuestos="'+impuestos +'" data-impuestosindexes="'+impuestosid +'" data-id_local = "'+row.id_local+'" data-formulado="'+ row.formulado +'" onclick="agregarCompra(this); return false;" ontap="agregarCompra(this); return false;" class="producto btn btn-lg btn-primary categoria_producto_'+row.idc +'">'+ row.formulado +'</div>');
									t++;
								}
								for(var s=0;s<=vectorpos.length;s++){
									$('#listaProductos').append(vectorpos[s]);
								}
								//$('.producto').hide();
								//init2(categoria);
							}else{
								var agregar='<div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+categoria+'"></div><div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+categoria+'"></div><div style="background-color:white; border:1px solid white; border-radius:0px;" class="producto btn btn-lg btn-primary categoria_producto_'+categoria+'"></div>';
								$('#listaProductos').append(agregar);
							}
							if($(window).height()>500){
									Init31();
								}
								else{
									Init3();
								}

							//$('#listaProductos').fadeIn();
							$('#listaProductos').css("display","");
							//para mostrar productos por pagina
							showProducts(categoria);
						});	
					}
				}
			}
		});			
	},errorCB,successCB);
	$('.producto').hide();
	//$('.categoria_producto_'+ categoria).show();
	if($(window).height()>500){
			Init31();
		}
		else{
			Init3();
		}
	showProducts(categoria);
}

function PagoAvanzado(){
	pagonormal=false;
	$('.simple').css('display','none');
	$('.columna2').fadeIn();
	$('.tipopago,.basurero').fadeIn();
	$('.categoryChosen').click();
	$('#pagoavan').css('display','none');
	$('.paymentMethods').val('0.00');
	$('#valortarjeta,#valorcheque1,#valorcxc').val('0.00');
	$('.card').attr("data-value","0");
	$('.cardv').html("");
	var pagado=0;
	$('.paymentMethods').each(function(){
		if($(this).val()!='')
			pagado+=parseFloat($(this).val());
	});
	
	var mitot=parseFloat($('#invoiceTotal').html());
	$('#invoicePaid').html(pagado.toFixed(2));
	
	if((mitot-pagado)>0){
		$('#invoiceDebt').html("FALTANTE");
		$('#changeFromPurchase').html(mitot.toFixed(2));
	}else if((mitot-pagado)==0){
		$('#invoiceDebt').html("VUELTO");
		$('#changeFromPurchase').html("0.00");
	}else{
		$('#invoiceDebt').html("VUELTO");
		$('#changeFromPurchase').html(mitot.toFixed(2));
	}
}

function VerificarAgregados(btnprod,origen){
	var db = window.openDatabase("Database", "1.0", "PractisisMobile", 200000);
	var mitimespan=$(btnprod).attr("id");
	if(mitimespan.indexOf('busc_')>=0)
		mitimespan=mitimespan.substring(5);
	db.transaction(
	function (tx){
		tx.executeSql('SELECT * from MODIFICADORES WHERE id_formulado LIKE ? and activo=? order by no_modificador asc',[mitimespan,"true"],function(tx,res1){
			var mods= new Array();
			if(res1.rows.length>0){
				$('#titlemodificador').html("Modificadores de "+$(btnprod).attr("data-formulado"));
				$('#id_formulado_modificadores').val(mitimespan);
				for(var m=0;m<res1.rows.length;m++){
					var miobj=res1.rows.item(m);
					var objmod=res1.rows.item(m).no_modificador;
					if(!('"'+objmod+'"' in mods))
						mods['"'+objmod+'"']= new Array();
					
					mods['"'+objmod+'"'].push("<button style='margin:3px;' class='btn btn-primary btn-lg' id='btnmodif_"+miobj.id+"' data-valor='"+miobj.valor+"' data-time='"+miobj.timespan+"'  onclick='SiguienteModificador("+objmod+","+miobj.id+","+origen+");' type='button'>"+miobj.nombre+"</button>");
					
				}
				
				console.log(mods);
				var c=1;
				$('#divmodificadores').html('');
				for(var s in mods){
					var display='';
					if(c>1)
						display='display:none';
					
					var inhtml="<div class='grupobotones' id='mod_"+s.replace(/"/g,'')+"' data-orden="+c+" style='margin:5px;"+display+"'>";
					for(var t in mods[s]){
						inhtml+=mods[s][t];
					}
					inhtml+="<button style='margin:3px;' class='btn btn-default btn-lg' type='button' onclick='SiguienteModificador("+s.replace(/"/g,'')+",0,"+origen+");'>Ninguno</button></div>";
					$('#divmodificadores').append(inhtml);
					c++;
				}
				$('#popupModificadores').modal("show");
				
			}else{
				agregarCompra($(btnprod),origen);
			}
		});
	},errorCB,successCB);
} 

function SiguienteModificador(divid,idmod,origen){
	var div=$('#mod_'+divid);
	var orden=div.attr("data-orden");
	$('.grupobotones').css('display','none');
	var ya=false;
	$('.grupobotones').each(function(){
		if($(this).attr('data-orden')>orden){
			if(ya==false){
				$(this).fadeIn();
				ya=true;
			}
			
		}
	});
	
	if(idmod>0){
		var elbotonm=$('#btnmodif_'+idmod);
		var valormas=elbotonm.attr("data-valor");
		var valortime=elbotonm.attr("data-time");
		var nombrem=elbotonm.html();
		var dataagreg=$('#'+$('#id_formulado_modificadores').val()).attr("data-modificadores");
		if(origen==2)
			dataagreg=$('#busc_'+$('#id_formulado_modificadores').val()).attr("data-modificadores");
		var agregadoschain="";
		if(dataagreg!=null&&dataagreg!=''&&dataagreg!='undefined')
			agregadoschain=dataagreg+"@"+nombrem+"|"+valormas+"|"+valortime;
		else
			agregadoschain=nombrem+"|"+valormas+"|"+valortime;
		
		//alert(agregadoschain);
		
		if(origen==2)
			$('#busc_'+$('#id_formulado_modificadores').val()).attr("data-modificadores",agregadoschain);
		else
			$('#'+$('#id_formulado_modificadores').val()).attr("data-modificadores",agregadoschain);
	}
	
	if(ya==false){
		$('#popupModificadores').modal("hide");
		if(origen==2)
		agregarCompra($('#busc_'+$('#id_formulado_modificadores').val()),origen);
		else
		agregarCompra($('#'+$('#id_formulado_modificadores').val()),origen);
	}
}

function AsignarNombre(){
	var n=$('#ordername').val();
	if(n!=''&&n!=null){
		localStorage.setItem("nameorder",n);
	}
	$('#popupNameorder').modal("hide");
}



