<?php
	session_start();
	ini_set('display_startup_errors',1);
	ini_set('display_errors',1);
	error_reporting(-1);
	$_SESSION['direccion']='159.203.172.166';
	$gbd = new DBConn('administrador_practisis');
	
	//integracion_datil 1:envia facturas de dora a datil
	$query="select id,empresa from empresas where id_version=8 order by empresa";
	//$query="select id,empresa from empresas where id>='2391' and id<='2400' and apikeydatil!=''";
	$stmt = $gbd -> prepare($query);
	$stmt->execute();
	$arrayres=$stmt->fetchAll(PDO::FETCH_ASSOC);
	echo "<table><tr><th>No.</th><th>Empresa</th><th>No. Base</th></tr>";
	$cont=1;
	foreach($arrayres as $k=>$v){
		$sqlexistebase="SELECT * from pg_database where datname=?";
		$stmt = $gbd -> prepare($sqlexistebase);
		$stmt->execute(array('emp'.$v['id']));
		if($stmt->rowCount()>0){
			$gbd = new DBConn('emp'.$v['id']);
			//$sqltieneconf='select count(*) as cuan from asientos having count(asientos.*)>50';
			//$sqltieneconf='select count(*) as cuan from asientos having count(asientos.*)>50';
			//$sqltieneconf='insert into datil_operation (recibe_facturas,recibe_notas_credito,envia_retenciones_compras) values (?,?,?)';
			$sqltieneconf="select count(*),comprobante,fecha from asientos where comprobante ilike '%Fact. %' group by comprobante,fecha having count(*)>1 order by fecha";
			$stmt = $gbd -> prepare($sqltieneconf);
			$stmt->execute();
			if($stmt->rowCount()>0){
				echo "<tr><td>".$cont."</td><td>".$v['empresa']."</td><td>".$v['id']."</td></tr>";
				$cont++;
			}
			//$stmt->execute(array('true','true','true'));
			/*$rowconf=$stmt->fetch(PDO::FETCH_ASSOC);
			if($rowconf['cuan']>2){
				//inserta id de facturas en asiento original de venta
				//$sqlinsert="update diario set idfacturacliente=n.idfactura,pago_directo=-1 from (select d.id as iddiario,t.id as idfactura,t.valor from (select f.idasiento,sum(p.valor) as valor,p.idformapago,f.id from facturacion f,pagos p where f.anulada='false' and f.idasiento>0 and esnotadecredito='false' and p.idfactura=f.idreal and p.valor>0 group by f.id,p.idformapago  order by idasiento)as t,diario d where d.idasiento=t.idasiento and t.idformapago in (1,3,14,6) and round(t.valor::numeric,2)=round(abs(d.valor)::numeric,2) and d.descripcion ilike '%formas de pagos%') as n where diario.id=n.iddiario";
				
				//si ya existe no inserta
				$sqlexiste="select id from tiles_arriba where id=454";
				$stmte = $gbd -> prepare($sqlexiste);
				$stmte->execute();
				if($stmte->rowCount()==0){
					//inserta linea reporte bg con inicio
					$sqlinsert="insert into tiles_arriba values (			
					454,'*balanceinicio','#A7C2C2','repcontables',5,'Balance General Movimiento','','','repcontables','backoffice')";
					$stmti = $gbd -> prepare($sqlinsert);
					$stmti->execute();
					
					
					$sqlinserta="insert into empleados_tiles_arriba (id_empleado,id_tile_arriba) values ((select id_cliente_practisis_admin from empleados where id_cliente_practisis_admin>0 limit 1),454)";
					$stmtia = $gbd -> prepare($sqlinserta);
					$stmtia->execute();
				}*/
				
			//}
			
		}
	}
	echo "</table>";

	class DBConn extends PDO{
    public function __construct($dbname){
      include ('/var/www/practisis.net/public/ips_enoc.php');
		$user = 'practisis3';
		$pass = 'Zuleta99@251!';
        $auxdireccion = isset($auxdireccion) ? $auxdireccion : 0;

        if(!isset($_SESSION)){
        	session_start();
        }
        if($dbname == 'administrador_practisis'){
        $host = $ip_real;
        }else if($dbname == 'bd_ideal'){
        $host = $ip_real;
        }else if($dbname == 'weblic'){
        $host = $ip_real;
        }else if($dbname == 'base_template_empresa'){
        $host = $ip_real;
        }else if($auxdireccion == 1){
        $host = base64_decode($sec);
        }else if($auxdireccion == 2){
        $host = $hostd;
        }else{
        $host = $_SESSION['direccion'];
        }
		
        parent::__construct('pgsql: host='.$host.'; dbname='.$dbname, $user, $pass);
        $this -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this -> setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
		}
	}
	
	
?>