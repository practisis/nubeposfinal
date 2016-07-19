<?php

//echo "Ana";
error_reporting(-1);
$startDate = isset($_REQUEST['startDate']) ? $_REQUEST['startDate'] : date("Y-m-d", strtotime('-1 day'));
$endDate = isset($_REQUEST['endDate']) ? $_REQUEST['endDate'] : date("Y-m-d");
$local = isset($_REQUEST['local']) ? $_REQUEST['local'] : '';
$buscar = isset($_REQUEST['buscar']) ? $_REQUEST['buscar'] : '';

$compras = new Compras($startDate,$endDate,$local,$buscar);
$data = $compras -> FetchAdditionalInformation();
$retiva = $compras -> RetencionesIva();
$ret = $compras -> Retenciones();
$locals = new Locals;

//print_r($ret);

$centrocosto= new CentroCosto();

$buttonIndex = 'new';
$buttonText = 'Guardar';
$registro = '';
$proveedor = '';
$idtipodocumento = '';
$sri = '';
//$caduca = '';
$serie = '';
$nodocumento = '';
$ingreso = '';
$vencimiento = '';
$idbodega = $local;
$subtotaliva = 0;
$subtotalsiniva = 0;
$subconivabruto = 0;
$subsinivabruto = 0;
$iva = 0;
$total = 0;
$descuentoiva = 0;
$descuentosiniva = 0;
$ice = 0;
$verde = 0;
$formulados = array();
$gastos=array();
$seriemodificado = '';
$documentomodificado = '';
$autorizacionmodificado = '';
$comprobantemodificado = '';
$display = 'none';
$id = '';
$totalretencion = 0;
$base_iva_total = 0;
$base_sub_civa_total = 0;
$base_sub_siva_total = 0;
$numero_retencion = '';
$id_retencion = 0;
$ingresoret = date("Y-m-d");
$retsetalle = array();
$asientoret=0;
$asientoc=0;
$esgasto = 0;
$desc='';
$ivaaux = '0.14';
$anulada = 0;
$abonos_c = 0;

//echo "esto es:".$_REQUEST['id'];
if(isset($_REQUEST['id'])){
	$id = $_REQUEST['id'];
	$completeInfo = $compras -> FetchSpecifikInformation($id);
	//print_r($completeInfo);
	$registro = $id;
	$proveedor = $completeInfo[$id]['idproveedor'];
	$idtipodocumento = $completeInfo[$id]['idtipodocumento'];
	$sri = $completeInfo[$id]['autorizacion'];
	$caduca = date("Y-m-d",strtotime($completeInfo[$id]['fechacaduca']));
	$serie = $completeInfo[$id]['serie'];
	$nodocumento = $completeInfo[$id]['nodocumento'];
	$ingreso = date("Y-m-d",strtotime($completeInfo[$id]['fecha']));
	$vencimiento = date("Y-m-d",strtotime($completeInfo[$id]['fechavencimiento']));
	$idbodega = $completeInfo[$id]['idbodega'];
	$subtotaliva = $completeInfo[$id]['subtotaliva'];
	$subtotalsiniva = $completeInfo[$id]['subtotalsiniva'];
	$subconivabruto = $completeInfo[$id]['subconivabruto'];
	$subsinivabruto = $completeInfo[$id]['subsinivabruto'];
	$iva = $completeInfo[$id]['iva'];
	$total = $completeInfo[$id]['total'];
	$descuentoiva = $completeInfo[$id]['descuentoiva'];
	$descuentosiniva = $completeInfo[$id]['descuentosiniva'];
	$ice = $completeInfo[$id]['ice'];
	$verde = $completeInfo[$id]['verde'];
	$formulados = $completeInfo[$id]['formulados'];
	//print_r($formulados);
	$seriemodificado = $completeInfo[$id]['seriemodificado'];
	$documentomodificado = $completeInfo[$id]['documentomodificado'];
	$autorizacionmodificado = $completeInfo[$id]['autorizacionmodificado'];
	$comprobantemodificado = $completeInfo[$id]['comprobantemodificado'];
    $esgasto =(int) $completeInfo[$id]['es_gasto'];
	$asientoc=$completeInfo[$id]['idasiento'];
	$desc=$completeInfo[$id]['descripcion'];
    $abonos_c = $completeInfo[$id]['abono'];
    $anulada =(int) $completeInfo[$id]['anulada'];
    $cancelada =(int) $completeInfo[$id]['cancelada'];
    //echo $abonos_c;

	if($asientoc==0){
		$gbd = new DBConn('emp'.$_SESSION['clave']);
		$sql = "SELECT id FROM asientos WHERE idcompragasto = ?";
		$stmtg = $gbd -> prepare($sql);
		$stmtg -> execute(array($id));
		if($stmtg->rowCount()>0){
			$datag=$stmtg->fetch(PDO::FETCH_ASSOC);
			$asientoc=$datag['id'];
		}
	}
    //echo $esgasto;
	$buttonIndex = 'update';
	$buttonText = 'Guardar';
	$gastos=$completeInfo[$id]['gastos'];
	if($idtipodocumento == 4){
		$display = '';
	}

    $retnum = $compras -> SacaNumeroRetencion($id);
    foreach($retnum as $keyn => $valuen){
        $numero_retencion = $valuen['numero_retencion'];
        $id_retencion = $valuen['id'];
        $serieret = $valuen['serie'];
        $sriret = $valuen['autorizacion'];
        $ingresoret = $valuen['fecha_ingreso'];
        $caducaret = $valuen['fecha_caducidad'];
		$asientoret= $valuen['idasiento'];
    }

    $retsetalle = $compras -> SacaDetalleRetencion($id_retencion);

    $fecha_inicioaux = str_replace("-","/",$ingreso);
    $fecha_inicio = strtotime($fecha_inicioaux);
    $fecha_fin = strtotime("2016/05/31");
    if($fecha_inicio > $fecha_fin){
        $ivaaux = '0.14';
    }else{
        $ivaaux = '0.12';
    }

	}else{
		$caduca = date("Y-m-d");
		$ingreso = date("Y-m-d");
		$caducaret = isset($_REQUEST['caducaret']) ? $_REQUEST['caducaret'] : date("Y-m-d");
		$sriret = isset($_REQUEST['sriret']) ? $_REQUEST['sriret'] : '';
		$serieret = isset($_REQUEST['serieret']) ? $_REQUEST['serieret'] : '';
	}

    //echo $id_retencion;
    if($abonos_c > 0 || $id_retencion != 0 || $anulada == 1){
      $verguardar = 'none';
    }else{
      $verguardar = 'block-inline';
    }

    if($anulada == 1){
      $veranular = 'none';
    }else{
      $veranular = 'block-inline';
    }

    if($id_retencion == 0){
    $configb = new Config_Backoffice;
    $configback = $configb -> Config_Backoffice();
    $contret = 0;
      foreach($configback as $keyconfig => $valueconfig){
          $serieret = $valueconfig['serie'];
          $sriret = $valueconfig['autorizacion'];
          $caducaret = $valueconfig['fecha_caducidad'];
          $contret++;
      }

      if($contret == 0){
        $serieret = '';
        $sriret = '';
        $caducaret = date("Y-m-d");
      }

    }

    $cliente = $_SESSION['cliente'];

?>
<style>
  .ui-autocomplete {
    max-height:100px;
    overflow-y: scroll;
    overflow-x: hidden;
	height:100px;
  }
</style>
<script type="text/javascript">
$( document ).ready(function() {
	
//alert($('#haycentrodecosto').val());
if(!($('#haycentrodecosto').val()=='true')){
	
	//alert('nocentro');
	$('#tableoverview tr').each(function(){
		$(this).find('td:eq(2)').css('display','none');
	}); 

	$('#tablegastos tr').each(function(){
		$(this).find('td:eq(1)').css('display','none');
	}); 
		
	$('.prim-header1').each(function(){
		$(this).find('th:eq(2)').css('display','none');
	});

	$('.prim-header2').each(function(){
		$(this).find('th:eq(1)').css('display','none');
	});
		
	$('#divcentrocosto').css('display','none');
}
		

var registro=$('#registro').val();
$("[name='esgas']").bootstrapSwitch();
$('input[name="esgas"]').on('switchChange.bootstrapSwitch', function(event, state) {
	if(state == true){
		  $('#esgasto').val(1);		  
	}else if(state == false){
		  $('#esgasto').val(0);
	}
});

    var gasto = $('#esgasto').val();
if (registro>0){   
   if(gasto == 1){
		$('input[name="esgas"]').bootstrapSwitch('state', true);
		$('#myTabs li:eq(0) a').hide();
		$('#lbl_bodega').hide();
		$('#sel_bodega').hide();
		$('#myTabs li:eq(1) a').tab('show') ;
	}else{
		$('input[name="esgas"]').bootstrapSwitch('state', false);
		$('#myTabs li:eq(1) a').hide() ;
		$('#myTabs li:eq(0) a').tab('show') ;
	}
	}

	if (registro>0)
{
	$('input[name="esgas"]').bootstrapSwitch('disabled', true);

}
else
{
		$('input[name="esgas"]').bootstrapSwitch('disabled', false);
	
}	
	
var abono_compra = $('#abono_compra').val();
var idco = $('#id').val();
var idretencionaux = $('#idretencionaux').val();

//alert(idretencionaux);

if(idco == 0){
  document.getElementById('btnanular').style.display = 'none';
}else{
  document.getElementById('btnanular').style.display = 'block-inline';
}

    if(abono_compra>0 || idretencionaux != '0'){

      $('#btnanular').prop("disabled","disabled");
      $('#div_anular').tooltip('hide')
      .attr('data-original-title', "No puede anular esta compra por que tiene abonos y/o retenciones en la compra")
      .tooltip('fixTitle')
      .tooltip('show')

    }

});
// Evita que evie el enter
function stopRKey(evt) {
  var evt = (evt) ? evt : ((event) ? event : null);
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}

document.onkeypress = stopRKey; 

function handleClick(cb) {
  //display("Clicked, new value = " + cb.checked);
  if (cb.checked===true)
  {
		$('#myTabs a[href="#gastos"]').tab('show') ;
		$('#lbl_bodega').hide();
		$('#sel_bodega').hide();
   		/*$('option:selected', 'select[name="bodega"]').removeAttr('selected');
		$('select[name="bodega"]').find('option[value="1"]').attr("selected",true);*/
        $('#verproducto').hide();
        $('#vergasto').show();
		
  }else{
	 //		$('#myTabs li:eq(1) a').hide();
		$('#lbl_bodega').show();
		$('#sel_bodega').show();
		$('#myTabs a[href="#productos"]').tab('show') ;
		//$('option:selected', 'select[name="bodega"]').removeAttr('selected');
        $('#vergasto').hide();
        $('#verproducto').show();
  }
  
}


function ColocarCentro(miselect){
	$('.selcentroc').val($(miselect).val());
}

// obligated
function valbodega(){
	//val esgasto =$('#esgasto').val();

    var es_gasto=  $('#esgas').bootstrapSwitch('state');
	if(es_gasto===true)
	{
		$("#bodega").removeClass('obligated');
	}
	else
	{
		$("#bodega").addClass('obligated');
	}
}

function anularcompra(){
  var idcompra = document.getElementById('id').value;
  $.ajax({
  type: 'POST',
  url: 'ajax/egresos/anula_compras.php',
  data: 'idcompra='+ idcompra,
  success: function(response){
    //alert(response);
    var res = response.split("||");
  	    if(res[0] == 'ok'){
          /*document.getElementById('btnguarda').style.display='none';
          document.getElementById('btnanular').style.display='none';*/
          location.reload(true);
  		}
  	}
  });
}
</script>
<?php //print_r($formulados);?>
<div class="col-lg-12">
	<div class="panel panel-default">
		<div class="panel-body">
			<form method="post" class="form-inline">
			<input id="haycentrodecosto" type="hidden" style="display:none;" value="<?php echo $_SESSION['tienecentrocosto']; ?>" />
            <input type='hidden' style='display:none;' id='abono_compra' name='abono_compra' value='<?php echo htmlspecialchars($abonos_c);?>'/>
				<!--<div class="table-responsive">
					<table id="formtable" class="table">-->
			<div class='row'>
					<div class='col-md-3'>
						<label>Es Gasto</label>
						<div class="input-group">
							<input type="checkbox" name="esgas" onchange='handleClick(this);' id="esgas" data-size='mini' data-off-text="NO" data-on-text="SI"/><br/>
							<input type='hidden' value='<?php echo $esgasto;?>' id='esgasto' name='esgasto'/>
                            <input type='hidden' value='<?php echo $id_retencion;?>' id='idretencionaux' name='idretencionaux'/>
						</div>
					</div>
				</div>
					
						<div class='row'>
							<div class='col-md-3'>
								<label>Registro #</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-pencil" id="sizing-addon2"></span>
									<input type="text" id="registro" name="registro" readonly="readonly" class="form-control input-sm" placeholder="Registro" aria-describedby="sizing-addon2" value="<?php echo $registro;?>"/>
								</div>
							</div>
							<div class='col-md-3'>
								<label>Proveedor</label>
                                <!--onclick='verProveedor()'-->
								<div class="input-group">
									<span class="input-group-addon fa fa-truck" id="sizing-addon3" style="width: 10px;cursor:pointer;"></span>
									<select name="proveedor" class="form-control input-sm obligated" aria-describedby="sizing-addon3" style="line-height: 0; padding: 0px; height: 25px;width:100%;">
									<option value="">Seleccionar Proveedor</option>
										<?php
										foreach($compras -> proveedores as $key => $value){
											$selected = '';
											if($key == $proveedor){
												$selected = 'selected="selected"';
												}

											echo '<option '.$selected.' value="'.(int)$key.'">'.htmlspecialchars($value['proveedor']).'</option>';
											}
										?>
									</select>
								</div>
							</div>
							<div class='col-md-3'>
								<label>Tipo Comprobante</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-file" id="sizing-addon4" style="width: 10px;"></span>
									<select id="comprobante" name="comprobante" class="form-control input-sm obligated" aria-describedby="sizing-addon3" style="line-height: 0; padding: 0px; height: 25px; width:100%;">
										<option value="">Seleccionar Comprobante</option>
										<?php
										foreach($compras -> comprobante as $key => $value){
											$selected = '';
											if($key == $idtipodocumento){
												$selected = 'selected="selected"';
												}

											echo '<option '.$selected.' value="'.(int)$key.'">'.htmlspecialchars($value['codigo']).' '.htmlspecialchars($value['comprobante']).'</option>';
											}
										?>
									</select>
								</div>
							</div>
							<div class='col-md-3'>
								<label>Fecha Ingreso Bodega</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-calendar" id="sizing-addon2"></span>
									<!--<input type="text" name="ingreso" id="ingreso" onchange="rv();" class="form-control input-sm obligated datepickerLimitToday" readonly="readonly" placeholder="Fecha Ingreso" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($ingreso);?>"/>-->
                                    <input type="text" name="ingreso" id="ingreso" onchange="cambiaiva();" class="form-control input-sm obligated datepicker" readonly="readonly" placeholder="Fecha Ingreso" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($ingreso);?>"/>
								</div>
							</div>
						</div>
						<div class='row'>
							<div class='col-md-3'>
								<label>Autorización SRI</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-check-square-o" id="sizing-addon2"></span>
									<input type="text" name="sri" id="sri" class="form-control input-sm obligated" placeholder="Autorización SRI" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($sri);?>"/>
								</div>
							</div>
						
							<div class='col-md-3'>
								<label>Serie</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-check-square" id="sizing-addon2"></span>
									<input type="text" name="serie" id="serie" class="form-control input-sm obligated" placeholder="Serie" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($serie);?>"/>
								</div>
							</div>
							<div class='col-md-3'>
								<label>Documento</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-file-o" id="sizing-addon2"></span>
									<input type="text" name="documento" id="documento" class="form-control input-sm obligated" placeholder="Documento" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($nodocumento);?>"/>
								</div>
							</div>
							<div class='col-md-3'>
								<label>Fecha Caducidad Doc.</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-calendar" id="sizing-addon2"></span>
									<input type="text" name="caduca" id="caduca" class="form-control input-sm obligated datepickerNotLessThanFirst" readonly="readonly" placeholder="Fecha Caduca" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($caduca);?>"/>
								</div>
							</div>
						</div>
						<div class='row'>
							<div class='col-md-3'>
								<label>Vencimiento</label>
								<div class="input-group">
									<span class="input-group-addon  fa fa-calendar" id="sizing-addon2"></span>
									<input type="text" name="vencimiento" id="vencimiento" class="form-control input-sm obligated datepicker" readonly="readonly" placeholder="Vencimiento" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($vencimiento);?>"/>
								</div>
							</div>
							<div class='col-md-3'>
								<label id="lbl_bodega">Bodega de Ingreso</label>
								<div class="input-group" id="sel_bodega">
									<span class="input-group-addon fa-th" id="sizing-addon4" style="width: 10px;"></span>
									<select  id="bodega" name="bodega"  class="form-control input-sm " aria-describedby="sizing-addon3" style="line-height: 0; padding: 0px; height: 25px; width:100%; display:block;">
									<option value="0">Seleccionar Bodega</option>
										<?php
										foreach($locals -> locals as $key => $value){
											$selected = '';
											if($key == $idbodega){
												$selected = 'selected="selected"';
												}
											echo '<option '.$selected.' value="'.(int)$key.'">'.htmlspecialchars($value['bodega']).'</option>';
											}
										?>
									</select>
								</div>
							</div>
							<div class='col-md-3'>
							<label>Descripción</label>
							<div class="input-group">
								<span style='width:10%;' class="input-group-addon fa fa-pencil-square-o" id="sizing-addon2"></span>
								<input style='max-width:90%;' type='text' class='form-control input-sm' value='<?php echo $desc; ?>' id='desccompra' name='desccompra' placeholder='Descripcion'/>
							</div>
							</div>
							<div class='col-md-3' id='divcentrocosto'>
								<label>Centro de Costo</label>
								<div>
								<select onchange='ColocarCentro(this);' class='form-control'><option value='0'>Seleccione Centro de Costo</option>
								<?php
									foreach($centrocosto->lista as $key=>$value){
										echo "<option value='".$key."'>".$value['nombre']."</option>";
									}
								?>
								</select>
								</div>
							</div>
						</div>
					<!--</table>
				</div>-->
				<div class="notadecredito" style="padding: 0px; margin: 0px; display: <?php echo $display;?>;">
					<div style='width:100%;'>
						
							<div class='row'>
								<div class='col-md-3'>
									<label># Serie Modificado</label>
									<div class="input-group">
										<span class="input-group-addon fa fa-credit-card" id="sizing-addon2"></span>
										<input type="text" name="serieMod" class="form-control input-sm" placeholder="Serie Modificado" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($seriemodificado);?>"/>
									</div>
								</div>
								<div class='col-md-3'>
									<label># Documento Modificado</label>
									<div class="input-group">
										<span class="input-group-addon fa fa-credit-card" id="sizing-addon2"></span>
										<input type="text" name="docMod" class="form-control input-sm" placeholder="Documento Modificado" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($documentomodificado);?>"/>
									</div>
								</div>
								<div class='col-md-3'>
									<label>T. Comprobante Modificado</label>
									<div class="input-group">
										<span class="input-group-addon fa fa-credit-card" id="sizing-addon2"></span>
										<select name="comprobanteMod" class="form-control input-sm" aria-describedby="sizing-addon3" style="line-height: 0; padding: 0px; height: 25px; width:100%;">
										<?php
										foreach($compras -> comprobante as $key => $value){
											if($key != 4){
												$selected = '';
												if($key == $comprobantemodificado){
													$selected = 'selected="selected"';
													}
													
												echo '<option '.$selected.' value="'.(int)$key.'">'.htmlspecialchars($value['codigo']).' '.htmlspecialchars($value['comprobante']).'</option>';
												}
											}
										?>
										</select>
									</div>
								</div>
								<div class='col-md-3'>
									<label>Autorización Doc. Modificado</label>
									<div class="input-group">
										<span class="input-group-addon fa fa-credit-card" id="sizing-addon2"></span>
										<input type="text" name="authDocMod" class="form-control input-sm" placeholder="Autorización Doc. Modificado" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($autorizacionmodificado);?>"/>
									</div>
								</div>
							</div>
						
					</div>
				</div>

				
				<br/>
				<div class='tab-content' id="myTabs" style="display: <?php echo $veranular;?>;">
                <ul class="nav nav-tabs" role="tablist">
                    <li id="verproducto" role="presentation" class="active" ><a href="#productos" aria-controls="bloque1" role="tab" data-toggle="tab">Productos</a></li>
					<li id="vergasto" role="presentation" style="display: none;"><a href="#gastos"  aria-controls="gastos" role="tab" data-toggle="tab">Gastos</a></li>
            		<li role="presentation"><a href="#retencion" onclick="cargadatos();" aria-controls="retencion" role="tab" data-toggle="tab">Retención</a></li>
            	</ul>
				<div id="productos" role="tabpanel" class="tab-pane fade in active">
					<div class='col-lg-12' style='padding-top:10px;'>
					<?php if($asientoc>0){ ?>
					<div style='text-align:right;'>
					<span style='padding-left:10px; padding-bottom:10px;display: block; margin: 0px auto; text-align: right;'><a href='?modulo=contabilidad&index=asiento_view&id=<?php echo $asientoc;?>'>Ir a asiento # <?php echo $asientoc;?></a>
					</span>
					</div>
					<?php } ?>
					<table style='width:100%'>
						<tr>
							<td>
								<div class="tableFixedHeader">
									<table class="table">
										<tr class="prim-header prim-header1">
											<th>Código</th>
											<th>Producto</th>
											<th>Centro Costo</th>
											<th>Empaque</th>
											<th>Cantidad</th>
											<th>P.Unit</th>
											<th>Total</th>
											<th><button type="button" onclick="AddLine();" class="addLine form-control input-sm fa fa-plus"></button>
											</th>
										</tr>
									</table>
								</div>
								<div class="tableFixedBody">
									<table id="tableoverview" class="table table-striped">
										<?php
										if(count($formulados)==0){
											echo '<tr id="origLine">';
												echo '<td>';
													echo '<input type="hidden" name="prodIVA[]"/>';
													echo '<input type="hidden" name="prodID[]"/>';
													echo '<input type="text" name="prodCode[]" onkeyup="ChangeFocus(this,event);" class=" form-control input-sm prodCode ui-autocomplete-input" autocomplete="off"/>';
												echo '</td>';
												echo '<td>';
													echo '<input type="text" name="prodName[]" onkeypress="ChangeFocus(this,event);"  class=" form-control input-sm prodName ui-autocomplete-input" autocomplete="off"/>';
												echo '</td>';
												echo '<td>';
													echo '<input type="text" name="centroCostod[]" readonly class="form-control input-sm" readonly/>';
												echo '</td>';
												echo '<td>';
													echo '<input type="hidden" name="prodConversion[]" class="form-control input-sm prodConversion"/>';
													echo '<select name="prodEmp[]" onchange="ChangeConversion(this);" class=" form-control input-sm prodEmp" style="line-height: 0; padding:  0px; height: 25px; width:100%;"></select>';
												echo '</td>';
												echo '<td>';
													echo '<input type="text" name="prodQty[]" onkeypress="ChangeFocus(this,event);" onblur="CorrectQty(this);" class=" form-control input-sm prodQty soloFloat" style="text-align: right;" autocomplete="off"/>';
												echo '</td>';
												echo '<td>';
													echo '<input type="text" name="prodPrice[]" readonly="readonly" class=" form-control input-sm prodPrice" style="text-align: right;" autocomplete="off"/>';
												echo '</td>';
												echo '<td>';
													echo '<input type="text" name="prodTotal[]" onkeypress="enterlinea(this,event);" onblur="CorrectQty(this);" class="form-control input-sm prodTotal soloFloat" style="max-width: 125px;text-align: right;" autocomplete="off"/>';
												echo '</td>';
												echo '<td>';
													echo '<button type="button" onclick="RemoveLine(this);" class="removeLine form-control input-sm fa fa-times"></button>';
												echo '</td>';
											echo '</tr>';
											}
										else{
											$i = 0;
											foreach($formulados as $key => $value){
												$rowid = '';
												if($i == 0){
													$rowid = 'id="origLine"';
													}
                                                $ivaactio=(int)$value['ivaactivo'];

                                                if($ivaactio==1){
                                                  $veraste = '';
                                                }else{
                                                  $veraste = '*';
                                                }

												echo '<tr '.$rowid.'>';
													echo '<td>';
														$tax = $value['iva'] == 't' ? 'true' : 'false';
														echo '<input type="hidden" name="prodIVA[]" value="'.$tax.'"/>';
														echo '<input type="hidden" name="prodID[]" value="'.(int)$value['idformulado'].'"/>';
														echo '<input type="text" name="prodCode[]" oninput="activallenado('.$i.');" onkeyup="ChangeFocus(this,event);" class="obligated form-control input-sm prodCode ui-autocomplete-input" value="'.htmlspecialchars($value['codigo']).'" autocomplete="off"/>';
													echo '</td>';
													echo '<td>';
														echo '<input type="text" name="prodName[]" oninput="activallenado('.$i.');" onkeypress="ChangeFocus(this,event);"  class="obligated form-control input-sm prodName ui-autocomplete-input" value="'.htmlspecialchars($value['formulado'].$veraste).'" autocomplete="off"/>';
													echo '</td>';
													echo '<td>';
														echo '<input type="text" readonly class="form-control input-sm" value="'.$value['centrocosto'].'" readonly  name="centroCostod[]" />';
													echo '</td>';
													echo '<td>';
														echo '<input type="hidden" name="prodConversion[]" class="form-control input-sm prodConversion"  value="'.(float)$value['convertir'].'"/>';
														echo '<select name="prodEmp[]" onchange="ChangeConversion(this);" class="obligated form-control input-sm prodEmp" style="line-height: 0; padding:  0px; height: 25px; width:100%;">';
															foreach($compras -> listingEmpaques[$value['idformulado']] as $index => $values){
																$selected = '';

																if($values['id'] == $value['idformuladoconversion']){
																	$selected = 'selected="selected"';
																	}
															
																echo '<option '.$selected.' data-conversion="'.(float)$values['conversion'].'" value="'.(int)$values['id'].'">'.htmlspecialchars($values['selected']).' '.htmlspecialchars($values['emp']).'</option>';
																}
														echo '</select>';
													echo '</td>';
													echo '<td>';
														echo '<input type="text" name="prodQty[]" onkeypress="ChangeFocus(this,event);" onblur="CorrectQty(this);" class="obligated form-control input-sm prodQty soloFloat" value="'.number_format(abs((float)$value['cantidad'] / (float)$value['convertir']), 4, '.', '').'" style="text-align: right;" autocomplete="off"/>';
													echo '</td>';
													echo '<td>';
														echo '<input type="text" name="prodPrice[]" readonly="readonly" class="obligated form-control input-sm prodPrice" value="'.number_format(((float)$value['preciounidad'] * (float)$value['convertir']), 4, '.', '').'" style="text-align: right;" autocomplete="off"/>';
													echo '</td>';
													echo '<td>';
														echo '<input type="text" name="prodTotal[]" onkeypress="enterlinea(this,event);" onblur="CorrectQty(this);" class="obligated form-control input-sm prodTotal soloFloat" style="max-width: 125px;text-align: right;" value="'.number_format(abs(((float)$value['preciounidad']  * (float)$value['convertir']) * ((float)$value['cantidad'] / (float)$value['convertir'])), 4, '.', '').'" autocomplete="off"/>';
													echo '</td>';
													echo '<td align="right">';
														echo '<button type="button" onclick="RemoveLine(this);" class="removeLine form-control input-sm fa fa-times"></button>';
													echo '</td>';
												echo '</tr>';
												$i++;
												}
											}
										?>
									</table>
								</div>
							</td>
						</tr>
					</table>
					</div>
				</div>
				<!---div gastos--->
				<div id='gastos' role="tabpanel" class="tab-pane fade in">
					<div class='col-lg-12' style='margin-top:10px;'>
						<?php if($asientoc>0){ ?>
						<div style='text-align:right;'>
						<span style='padding-right:10px; padding-bottom:10px;display: block; margin: 0px auto; text-align: right;'><a href='?modulo=contabilidad&index=asiento_view&id=<?php echo $asientoc;?>'>Ir a asiento # <?php echo $asientoc; ?></a>
						</span>
						</div>
						<?php } ?>
						<div class='tableFixedHeader2'>
						<table class='table'>
							<tr class='prim-header prim-header2'><th width='20%'>Cuenta</th><th width='20%' >Centro de Costo</th><th width='15%' style='text-align:right;'>$Sub con IVA</th><th width='15%' style='text-align:right;'>$Sub sin IVA</th><th width='25%' style='text-align:right;'>$Total</th><th width='5%'><button type="button" onclick="AddLineGasto();" class="addLine form-control input-sm fa fa-plus"
							></button>
							 </th></tr>
						</table>
						</div>
						<table class='table table-striped' id='tablegastos' >
							 <?php
								if(count($gastos)==0){
								  $cont=0;
									echo "<tr class='origLineg' id='fila_1'><td width='20%'>
									<input style='display:none;' class='idcuentas' type='hidden' id='idcuenta_1' name='cuentagasto[]'/>
									<input class='form-control input-sm cuentas' id='cuenta_1' style='max-width:100%; width:100%;'/></td>
                                    <td width='20%'><select class='form-control selcentroc input-sm' id='centrocosto_".($cont+1)."' name='centrocostod[]'><option value='0'>Seleccionar Centro Costo</option>";
									foreach($centrocosto->lista as $key=>$value){
										echo "<option value='".$key."' >".$value['nombre']."</option>";
									}
									echo "</select></td><td style='text-align:right;' width='20%'><input class='form-control input-sm subconiva' name='subconiva[]' id='subciva_1' value='0.00' onclick='this.select();' onkeyup='CalcularSublinea(this);'/></td><td width='15%' style='text-align:right;'><input class='form-control input-sm subsiniva' id='subsiva_1' name='subsiniva[]' value='0.00' onclick='this.select();' onkeyup='CalcularSublinea(this);'/></td><td style='text-align:right;' width='25%'><input class='form-control input-sm totales' id='total_1' name='totalgasto[]' value='0.00' readonly /></td><td style='width:5%;'><button id='delete_1' class='btn btn-danger btn-xs' onclick='EliminarFilaGasto(this);'>X</button></td></tr>";
								}else{
									$class='origLineg';
									$cont=0;
									foreach($gastos as $migasto){
										if($cont>0)
											$class='';
										echo "<tr class='".$class."' id='fila_".($cont+1)."'><td width='20%'>
										<input style='display:none;' class='idcuentas' type='hidden' id='idcuenta_".($cont+1)."' name='cuentagasto[]' value='".$migasto['idcuenta']."'/>
										<input style='max-width:100%; width:100%;' class='form-control input-sm cuentas' id='cuenta_".($cont+1)."' value='".$migasto['cuenta']." - ".$migasto['descripcion']."'/></td><td width='20%'><select class='form-control selcentroc input-sm' id='centrocosto_".($cont+1)."' name='centrocostod[]'><option value='0'>Seleccionar Centro Costo</option>";
										foreach($centrocosto->lista as $key=>$value){
											$selected='';
											if($migasto['cc']==$key)
												$selected=' selected ';
											
											echo "<option value='".$key."' ".$selected.">".$value['nombre']."</option>";
										}
										echo "</select></td><td style='text-align:right;' width='15%'><input class='form-control input-sm subconiva' name='subconiva[]' id='subciva_".($cont+1)."' value='".number_format($migasto['subconiva'],2)."' onclick='this.select();' onkeyup='CalcularSublinea(this);'
										/></td><td width='15%' style='text-align:right;'><input class='form-control input-sm subsiniva' id='subsiva_".($cont+1)."' name='subsiniva[]' value='".number_format($migasto['subsiniva'],2)."' onclick='this.select();' onkeyup='CalcularSublinea(this);'/></td><td style='text-align:right;' width='25%'><input class='form-control input-sm totales' id='total_".($cont+1)."' name='totalgasto[]' value='".number_format(((float)$migasto['subconiva']*1.12)+(float)$migasto['subsiniva'],2)."' readonly /></td><td style='width:5%;'><button id='delete_".($cont+1)."' class='btn btn-danger btn-xs' onclick='EliminarFilaGasto(this);'>X</button></td></tr>";
										$cont++;
									}
									
								}
							 ?>
						</table>
					</div>
				</div>
				<!------>
				
                <div id="retencion" role="tabpanel" class="tab-pane fade in">
				
						<?php if($asientoret!=0){ ?>
				
								<span style='padding-left:10px; padding-top:10px; display: block; margin: 0px auto; text-align: right;'><a href='?modulo=contabilidad&index=asiento_view&id=<?php echo $asientoret;?>'>Ir a asiento # <?php echo $asientoret;?></a></span>
		
						<?php }?>
				
					<div class='col-lg-12' style='border:1px solid #ADADAD; margin-top:10px; padding:10px;'>


					<table style='width:100%'>
                        <tr>
							<td style="width: 35%;">
								<input type='hidden' style='display:none;' id='asientoret' name='asientoret' value='<?php echo $asientoret;?>'/>
								<label># Retención</label>
								<div class="input-group">
  									<span class="input-group-addon fa fa-credit-card" id="sizing-addon2" style="width: 20px;"></span>
  									<input type="text" name="numretencion" id="numretencion" style="width: 95%;height: 25px;" class="form-control" placeholder="" aria-describedby="sizing-addon2" value="<?php echo $numero_retencion;?>"/>
  								</div>
							</td>
                            <td style="width: 10%;">
                                <label>Serie de Ret.</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-check-square" id="sizing-addon2"></span>
									<input type="text" name="serieret" id="serieret" class="form-control input-sm" placeholder="Serie" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($serieret);?>"/>
								</div>
                            </td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
                                <label>Autorización de Ret.</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-check-square-o" id="sizing-addon2"></span>
									<input type="text" name="sriret" id="sriret" class="form-control input-sm" placeholder="Autorización SRI" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($sriret);?>"/>
								</div>
                            </td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
                                <label>Fecha Ingreso Ret.</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-calendar" id="sizing-addon2"></span>
									<input type="text" name="ingresoret" id="ingresoret" class="form-control input-sm datepickerLimitToday" readonly="readonly" placeholder="Fecha Ingreso" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($ingresoret);?>"/>
								</div>
                            </td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
                                <label>Fecha Caduca</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-calendar" id="sizing-addon2"></span>
									<input type="text" name="caducaret" id="caducaret" class="form-control input-sm obligated datepickerNotLessThanFirst" readonly="readonly" placeholder="Fecha Caduca" aria-describedby="sizing-addon2" value="<?php echo htmlspecialchars($caducaret);?>"/>
								</div>
                            </td>
						</tr>
						<tr>
							<td style="width: 35%;">
								<label>Retención IVA</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-paw" id="sizing-addon4" style="width: 20px;"></span>
									<select id="retencioniva" name="retencioniva" onchange="retiva();" class="form-control" aria-describedby="sizing-addon4" style="line-height: 0; padding: 0px; height: 25px; width:95% !important;">
										<option value="0">Seleccionar Retencion Iva</option>
										<?php
										foreach($retiva as $keyri => $valueri){
											echo '<option value="'.(int)$keyri.'||'.$valueri['porcentaje'].'||'.htmlspecialchars($valueri['nombre']).'">'.htmlspecialchars($valueri['nombre']).'</option>';
											}
										?>
									</select>
								</div>
							</td>
                            <td style="width: 10%;">
    								<label>Porcentaje</label>
    								<div class="input-group">
    									<span class="input-group-addon fa fa-deviantart" id="sizing-addon2"></span>
    									<input type="text" name="porcretiva" id="porcretiva" style="width: 100%;text-align: right;" readonly="readonly" class="form-control input-sm" placeholder="" aria-describedby="sizing-addon2" value=""/>
    								</div>
							</td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
    								<label>Base Imponible</label>
    								<div class="input-group">
    									<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
    									<input type="text" name="baseretiva" id="baseretiva" style="width: 100%;text-align: right;" class="form-control input-sm" placeholder="Base" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$iva, 4, '.', '');?>"/>
                                        <input type="hidden" name="baseretivareal" id="baseretivareal" value="<?php echo number_format((float)$iva, 4, '.', '');?>"/>
    								</div>
							</td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
							</td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
    								<label>&nbsp;</label>
    								<button class="btn btn-primary" type="button" onclick="agregaretiva();">Agregar</button>
							</td>
						</tr>
                        <tr>
							<td style="width: 35%;">
								<label>Retención</label>
								<div class="input-group">
									<span class="input-group-addon fa fa-paw" id="sizing-addon4" style="width: 20px;"></span>
									<select id="reten" name="reten" onchange="ret();" class="form-control" aria-describedby="sizing-addon4" style="line-height: 0; padding: 0px; height: 25px; width:95% !important;">
										<option value="0">Seleccionar Retencion</option>
										<?php
										foreach($ret as $keyr => $valuer){
											echo '<option value="'.(int)$keyr.'||'.$valuer['porcentaje'].'||'.htmlspecialchars($valuer['nombre']).'">'.htmlspecialchars($valuer['nombre']).'</option>';
											}
										?>
									</select>
								</div>
							</td>
                            <td style="width: 10%;">
    								<label>Porcentaje</label>
    								<div class="input-group">
    									<span class="input-group-addon fa fa-deviantart" id="sizing-addon2"></span>
    									<input type="text" name="porcret" id="porcret" style="width: 100%;text-align: right;" readonly="readonly" class="form-control input-sm" placeholder="" aria-describedby="sizing-addon2" value=""/>
    								</div>
							</td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
    								<label>Base Imponible c/iva</label>
    								<div class="input-group">
    									<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
    									<input type="text" name="baseretsubciva" id="baseretsubciva" style="width: 100%;text-align: right;" class="form-control input-sm" placeholder="Base Sub con iva" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$subtotaliva, 4, '.', '');?>"/>
                                        <input type="hidden" name="baseretsubcivareal" id="baseretsubcivareal" value="<?php echo number_format((float)$subtotaliva, 4, '.', '');?>"/>
    								</div>
							</td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
    								<label>Base Imponible s/iva</label>
    								<div class="input-group">
    									<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
    									<input type="text" name="baseretsubsiva" id="baseretsubsiva" style="width: 100%;text-align: right;" class="form-control input-sm" placeholder="Base Sub sin iva" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$subtotalsiniva, 4, '.', '');?>"/>
                                        <input type="hidden" name="baseretsubsivareal" id="baseretsubsivareal" value="<?php echo number_format((float)$subtotalsiniva, 4, '.', '');?>"/>
    								</div>
							</td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;">
    								<label>&nbsp;</label>
    								<button class="btn btn-primary" type="button" onclick="agregaret(1);">Agregar</button>
							</td>
						</tr>

					</table>
					
                    <br>
                    <div style="width: 100%;height: 250px;overflow-x: hidden;overflow-y: auto;padding: 5px;border: 1px solid #ADADAD;">
                        <table id="detalleretenciones" class="table">
    						<tr class="prim-header">
    							<th>
    								Retención
    							</th>
    							<th>
    								Porcentaje
    							</th>
    							<th>
    								Base Imponible
    							</th>
    							<th>
    								Valor
    							</th>
                                <th>

    							</th>
    						</tr>
                            <?php
                            $contm = 0;
                            foreach($retsetalle as $keyd => $valued){

                                $base_iva = $valued['base_iva'];
                                $base_sub_civa = $valued['base_sub_civa'];
                                $base_sub_siva = $valued['base_sub_siva'];
                                $aux = $valued['aux'];
                                $contm++;

                                $base = $base_iva+$base_sub_civa+$base_sub_siva;

                                if($aux==1){
                                  $baseci = $base_iva;
                                  $accion = 'RemoveRowIva('.$contm.');';
                                }else if($aux==2){
                                  $baseci = $base_sub_civa;
                                  $accion = 'RemoveRow('.$contm.');';
                                }
                                $basesi = $base_sub_siva;
                                $valor = $base*($valued['porcentaje_retencion']/100);
                                $totalretencion += $valor;

                                $base_iva_total += $base_iva;
                                $base_sub_civa_total += $base_sub_civa;
                                $base_sub_siva_total += $base_sub_siva;

                            ?>
                            <tr id="<?php echo $contm;?>">
                             <td>
                                <input type="text" name="nombreret<?php echo $contm;?>" id="nombreret<?php echo $contm;?>" class="form-control" style="width: 100%;height:25px;" value="<?php echo $valued['nombre_retencion'];?>"/>
                                <input type="hidden" name="idret<?php echo $contm;?>" id="idret<?php echo $contm;?>" value="<?php echo $valued['id_retencion'];?>"/>
                             </td>
                             <td>
                                <input type="text" name="porcentajeret<?php echo $contm;?>" id="porcentajeret<?php echo $contm;?>" class="form-control" style="width: 100%;text-align: right;height:25px;" value="<?php echo $valued['porcentaje_retencion'];?>"/>
                                <input type="hidden" name="aux<?php echo $contm;?>" id="aux<?php echo $contm;?>" value="<?php echo $aux;?>"/>
                             </td>
                             <td>
                                <input type="text" name="baseret<?php echo $contm;?>" id="baseret<?php echo $contm;?>" class="form-control" style="width: 100%;text-align: right;height:25px;" value="<?php echo number_format($base, 4, '.', '');?>"/>
                                <input type="hidden" name="baseciva<?php echo $contm;?>" id="baseciva<?php echo $contm;?>" value="<?php echo $baseci;?>"/>
                                <input type="hidden" name="basesiva<?php echo $contm;?>" id="basesiva<?php echo $contm;?>" value="<?php echo $basesi;?>"/>
                             </td>
                             <td>
                                <input type="text" name="valorret<?php echo $contm;?>" id="valorret<?php echo $contm;?>" class="form-control" style="width: 100%;text-align: right;height:25px;" value="<?php echo number_format($valor, 4, '.', '');?>"/>
                             </td>
                             <td>
                                <button type="button" onclick="<?php echo $accion;?>" class="removeLine form-control input-sm fa fa-times"></button>
                             </td>
                            </tr>
                            <?php
                            }
                            if($id_retencion!=0){
                              echo '<script type="text/javascript">setTimeout(function(){ verbases('.$base_iva_total.','.$base_sub_civa_total.','.$base_sub_siva_total.'); }, 1500);</script>';
                            }
                            ?>
    					</table>
                    </div>
                    <input id="cuenta" name="cuenta" type="hidden" value="<?php echo $contm;?>">
                    <div style="height: 10px;width: 100%;"></div>
                    <table style='width:100%'>
                        <tr>
							<td style="width: 40%;">
							</td>
                            <td style="width: 10%;"></td>
                            <td style="width: 1%;"></td>
                            <td style="width: 15%;text-align: right;"><b>TOTAL RETENCIÓN</b></td>
                            <td style="width: 1%;"></td>
                            <td style="width: 20%;">
                              <input type="text" name="totalretencion" id="totalretencion" style="width: 100%;height: 35px;background-color: #333333; padding: 5px; color: #7bec38; font-size: 18px; text-align: right; font-weight: 600;" class="form-control" value="<?php echo number_format($totalretencion, 4, '.', '');?>"/>
                            </td>
                            <td style="width: 1%;"></td>
                            <td style="width: 6%;"></td>
						</tr>
                    </table>
					</div>
				</div>
			</div>
				<div class='row'>
					<div class='col-md-6' style="text-align: center;">
                    <?php
                    if($anulada == 1){
                    ?>
                    <span style="font-size: 36px;color: red;">Compra Anulada</span>
                    <?php
                    }else if($idtipodocumento == 4 && $cancelada == 0){
                    ?>
                    <div class='row'>
					    <div class='col-md-12' style="text-align: center;height: 90px;">
                        </div>
                    </div>
                    <div class='row'>
					    <div class='col-md-12' style="text-align: center;">
                            Abonar con esta Nota de Crédito
                            <button class="btn btn-success" onclick="verabonarnc();" type="button">Abonar</button>
                        </div>
                    </div>
                    <?php
                    }
                    ?>
                    </div>
					<div class='col-md-6'>
						<div style="width:100%; margin-left: auto; margin-right: 0;">
							<table class="table">
								<tr>
									<td>
										<label>Subtotal s/iva</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="firstSubSinIva" type="text" readonly="readonly" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format($subsinivabruto, 4, '.', '');?>"/>
										</div>
									</td>
									<td>
										<label>Descuento</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="firstDiscount" name="discount"  type="text" onkeydown="intOrFloat(event,this.value);" onkeyup="CalculateCosts(this);" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format($descuentosiniva, 4, '.', '');?>"/>
										</div>
									</td>
									<td>
										<label>Subtotal s/iva</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="finalSubSinIva" type="text" readonly="readonly" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$subtotalsiniva, 4, '.', '');?>"/>
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<label>Subtotal c/iva</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="firstSubConIva" type="text" readonly="readonly" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$subconivabruto, 4, '.', '');?>"/>
										</div>
									</td>
									<td>
										<label>Descuento</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="secondDiscount" name="discountIVA" type="text" onkeydown="intOrFloat(event,this.value);" onkeyup="CalculateCosts(this);" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$descuentoiva, 4, '.', '');?>"/>
										</div>
									</td>
									<td>
										<label>Subtotal c/iva</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="finalSubConIva" type="text" readonly="readonly" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$subtotaliva, 4, '.', '');?>"/>
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<label>ICE + CC</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="ice" name="ice" type="text" onkeydown="intOrFloat(event,this.value);" onkeyup="CalculateCosts();" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$ice, 4, '.', '');?>"/>
										</div>
									</td>
									<td>
										<label>Imp. Verde</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="impverde" name="impVerde" onkeydown="intOrFloat(event,this.value);" onkeyup="CalculateCosts();" type="text" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$verde, 4, '.', '');?>"/>
										</div>
									</td>
									<td>
										<label>IVA</label>
										<div class="input-group">
											<span class="input-group-addon fa fa-usd" id="sizing-addon2"></span>
											<input id="finalIVA" type="text" readonly="readonly" class="form-control input-sm text-right" aria-describedby="sizing-addon2" value="<?php echo number_format((float)$iva, 4, '.', '');?>"/>
										</div>
									</td>
								</tr>
								<tr>
									<td colspan="2"></td>
									<td>
										<div id="finalTotal" style="height: 40px; background-color: #333333; padding: 5px; color: #7bec38; font-size: 18px; text-align: right; font-weight: 600;">
											<?php echo number_format((float)$total, 2, '.', '');?>
										</div>
									</td>
								</tr>
							</table>
						</div>
					</div>
				</div>
                <br><br>
				<div style="text-align: right;display: <?php echo $veranular;?>;">
					<input type="hidden" name="id" id="id" value="<?php echo (int)$id;?>"/>
					<input type="hidden" name="<?php echo $buttonIndex;?>" value="compra"/>
                    <?php
                    if($cliente==1206){
                    ?>
                    <button class="btn btn-primary" onclick="location.href='?modulo=bodeguero&index=contabilizar&id=<?php echo (int)$id;?>';" type="button"><span class="glyphicon glyphicon-folder-close"></span>&nbsp;&nbsp;Contabilizar</button>
                    <?php
                    }
                    ?>
                    <button class="btn btn-primary" onclick="location.href='template/downloadExcel.php';" type="button"><span class="glyphicon glyphicon-save-file"></span> Bajar Modelo</button>
                    <button class="btn btn-primary" onclick="$('#excel').trigger('click');" type="button"><span class="glyphicon glyphicon-cloud-upload"></span> Subir Excel</button>
                    <div style="display:inline-block" id="div_anular" data-toggle="tooltip" data-placement="top" title="">
                    <button class="btn btn-danger" title=""   id='btnanular' type="button" onclick="anularcompra();">Anular</button>
                    </div>
					<button id="grabareal" class="btn btn-primary submit" type="button" style="display: none;"><?php echo $buttonText;?></button>
                    <button id="btnguarda" class="btn btn-primary" onclick="validarretencion(); valbodega();" type="button" style="display: <?php echo $verguardar;?>;"><?php echo $buttonText;?></button>
				</div>
                    <input type="hidden" name="datosretencion" id="datosretencion" value=""/>
                    <input type="hidden" name="datosdetalleretencion" id="datosdetalleretencion" value=""/>
                    <input type="hidden" name="tieneretencion" id="tieneretencion" value="0"/>
                    <input id="ivaaux" name="ivaaux" type="hidden" value="<?php echo $ivaaux;?>">
		</form>
			<br/>
			<div id="uploaderrors" style="display: none;" class="alert alert-danger" role="alert">...</div>
			
			<form id="fileform" method="post" enctype="multipart/form-data" action="ajax/bodegas/compras/upload.php">
				<input type="file" style="display: none;" name="excel" id="excel" />
			</form>

<div style='background-color:rgba(0,0,0,0.8); ' class="modal fade" id="popabonos" tabindex="-1">
  <div  class="modal-dialog modal-md" style="width: 80%;background-color: #FFFFFF; box-shadow: 2px 2px 5px #000000;display: block;overflow-x: hidden;overflow-y: auto;">
    <input type="hidden" name="idnc" id="idnc" value="<?php echo (int)$id;?>"/>
	<div class="modal-header">
		 <button type='button' style='color:#404041; margin-right:5px;' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>x</span></button>
		<h3 class='modal-title' style='text-align:center;'>Abonar</h3>
	</div>
    <div class="modal-body" style='color:#404041;'>
		<div class='alert alert-success' id='alertabonos' style='display:none;' role='alert'></div>
        <div style="text-align: center;font-size: 20px;font-weight: bold;">
            Total para abonar: <span id="totalabono">0.00</span>
        </div>
        <br>
          <div id="tablaabonos" class="table-striped" style="width: 100%;height: 370px;overflow-x: hidden;overflow-y: auto;font-size: 11px;">
          </div>
	</div>
    <div style='text-align:right;' class="modal-footer">
			<button class="btn btn-primary" style='margin-right:5px;' type="button" onclick='guardaabononc()'>Guardar</button>
			<button class='btn btn-danger' type='button' onclick='$("#popabonos").modal("hide");'>Cerrar</button>
    </div>
  </div>
</div>

		</div>
	</div>
</div>
<script type="text/javascript">
function verabonarnc(){
  $('#popabonos').modal('show');
  cargaabonos();
}
function cargaabonos(){
  var total = $('#finalTotal').html();
  $('#totalabono').html(total);
  $.ajax({
   url: "/contabilidad/ajax/egresos/compras/abonos.php",
   data:{que:'1'}
  }).done(function(resp){
  $('#loaderelim').fadeOut();
  var data=resp.split('|');
        //alert(data);
        $('#tablaabonos').html(data);
  });
}
function AbonaSaldo(quien,donde){
  var totalabonar = parseFloat($('#totalabono').html());
  var valor = parseFloat($('#totalabono_'+quien).html());
  var abonado = parseFloat($('#abono_'+quien).html());
  var abonadoreal = parseFloat($('#abonoreal_'+quien).html());
  var saldo = parseFloat($('#saldo_'+quien).html());

  if(donde == 2){
    if(totalabonar >= saldo){
      $('#abonar_'+quien).val(saldo.toFixed(4));
      abonado = abonado+saldo;
      $('#abono_'+quien).html(abonado.toFixed(4));
      saldo = valor-abonado;
      $('#saldo_'+quien).html(saldo.toFixed(4));
      totalabonar = totalabonar - abonado + abonadoreal;
      $('#totalabono').html(totalabonar.toFixed(4));
    }else{
      alert('El abono que desea ingresar sobrepasa su máximo para abonar.');
    }
  }

  if(donde == 1){
    if($('#abonar_'+quien).val() != ''){
      if(totalabonar >= saldo){
        var nuevoabono = parseFloat($('#abonar_'+quien).val());
        abonadoreal = abonadoreal+nuevoabono;
        $('#abono_'+quien).html(abonadoreal.toFixed(4));
        saldo = valor-abonadoreal;
        $('#saldo_'+quien).html(saldo.toFixed(4));
        //alert(totalabonar+'**rv12rv'+abonadoreal+'**'+abonado);
        totalabonar = totalabonar + abonado - abonadoreal;
        //alert(totalabonar+'**'+abonadoreal+'**'+abonado);
        $('#totalabono').html(totalabonar.toFixed(4));
      }else{
        alert('El abono que desea ingresar sobrepasa su máximo para abonar.');
      }
    }else{
      $('#abono_'+quien).html(abonadoreal.toFixed(4));
      saldo = valor-abonadoreal;
      $('#saldo_'+quien).html(saldo.toFixed(4))
      totalabonar = totalabonar + abonado - abonadoreal;
      $('#totalabono').html(totalabonar.toFixed(4));
    }
  }

}
function guardaabononc(){
  var idnc = $('#id').val();
  var $inputs = $('#tablaabonos :input');
   var totalnota = $('#finalTotal').val();
    var abonos = '';
    $inputs.each(function() {
        if($(this).val() != ''){
            abonos += $(this).attr("data-id")+'||'+$(this).val()+'||'+$(this).attr("data-valor")+'||'+$(this).attr("data-abonado")+'@@';
        }
    });
    //alert(abonos+'**'+idnc);
    $.ajax({
     url: "/contabilidad/ajax/egresos/compras/abonos.php",
     data:{que:'2',abonos:abonos,idnc:idnc,totalnota:totalnota}
    }).done(function(resp){
    $('#loaderelim').fadeOut();
    var data=resp.split('|');
          //alert(data);
          if(data[0] == 'ok'){
            location.reload(true);
          }else{
            alert('Hubo un error vuelva a intentarlo.');
          }
          //$('#tablaabonos').html(data);
    });
}
</script>