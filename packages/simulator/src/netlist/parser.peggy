// npx peggy --format es parser.peggy

{{
function binaryExp(head, tail) {
  return tail.reduce(
    (result, element) => ({
      type: "binary",
      op: element[1],
      arg1: result,
      arg2: element[3],
    }),
    head,
  );
}
}}

Netlist
  = ( _ LineEnd )* items:( @Item ( _ LineEnd )* )*
    { return { items }; }

Item =
  InstanceItem
  / ModelItem
  / EquationItem
  / ActionItem

InstanceItem
  = deviceId:Identifier ":" instanceId:Identifier
    _ nodes:NodeIdList
    _ modelId:ModelId?
    _ properties:PropertyList
    _ LineEnd
    {
      return {
        location: location(),
        type: "instance",
        deviceId,
        modelId,
        instanceId,
        nodes,
        properties,
      };
    }

ModelId
  = "@" @Identifier

NodeIdList
  = ids:( _ @NodeId )+
    { return ids; }

NodeId
  = @Identifier !( _ "=" )

PropertyList
  = properties:( _ @Property )*
    { return properties; }

Property
  = id:Identifier _ "=" _ value:PropertyValue
    { return { location: location(), id, value }; }

PropertyValue
  = value:String
    { return { location: location(), type: "string", value }; }
  / value:Expression
    { return { location: location(), type: "exp", value }; }

ModelItem
  = ".model"
    _ deviceId:Identifier
    _ modelId:ModelId
    _ properties:PropertyList
    _ LineEnd
    { return { location: location(), type: "model", deviceId, modelId, properties }; }

EquationItem
  = ".eq" _ id:VariableId _ "=" _ value:Expression _ LineEnd
    { return { location: location(), type: "equation", id, value, }; }

ActionItem
  = DcAnalysisItem
  / TrAnalysisItem
  / AcAnalysisItem

DcAnalysisItem
  = ".dc" _ properties:PropertyList sweeps:( _ @Sweep )* _ LineEnd
    { return { location: location(), type: "dc", properties, sweeps }; }

TrAnalysisItem
  = ".tr" _ properties:PropertyList sweeps:( _ @Sweep )* _ LineEnd
    { return { location: location(), type: "tr", properties, sweeps }; }

AcAnalysisItem
  = ".ac" _ properties:PropertyList sweeps:( _ @Sweep )* _ LineEnd
    { return { location: location(), type: "ac", properties, sweeps }; }

Sweep
  = ".sweep"
    _ id:VariableId _ properties:PropertyList
    { return { location: location(), type: "sweep", id, properties } }

Expression
  = AdditiveExp

AdditiveExp
  = head:MultiplicativeExp tail:( _ ( "+" / "-" ) _ MultiplicativeExp )*
    { return binaryExp(head, tail); }

MultiplicativeExp
  = head:ExponentiationExp tail:( _ ( "*" / "/" ) _ ExponentiationExp )*
    { return binaryExp(head, tail); }

ExponentiationExp
  = head:UnaryExp tail:( _ ( "^" ) _ UnaryExp )*
    { return binaryExp(head, tail); }

UnaryExp
  = op:( "-" / "+" ) _ arg:UnaryExp
    { return { location: location(), type: "unary", op, arg }; }
  / PrimaryExp

PrimaryExp
  = "(" _ @Expression _ ")"
  / ConstantExp
  / VariableExp
  / FunctionExp

ConstantExp
  = value:Number
    { return { location: location(), type: "constant", value }; }

VariableExp
  = id:VariableId
    { return { location: location(), type: "variable", id }; }

FunctionExp
  = id:Identifier _ args:Args
    { return { location: location(), type: "function", id, args }; }

Args
  = "(" _ args:( _ @Expression )* _ ")"
    { return args; }

VariableId
  = "$" @Identifier

Identifier "identifier"
  = $( [_a-zA-Z] [_a-zA-Z0-9]* )
    { return { location: location(), name: text() }; }

String "string"
  = '"' chars:$( !( '"' / "\n" / "\r" ) . )* '"'
    { return chars; }

Number "number"
  = $( "-"? Integer Frac? Exp? ) m:MetricUnit?
    { return Number.parseFloat(text()) * (m ?? 1); }

Integer
  = Digit+

Frac
  = "." Digit+

Exp
  = ( "e" / "E" ) ( "-" / "+" )? Digit+

MetricUnit
  = "T" { return 1e+12; }
  / "G" { return 1e+09; }
  / "M" { return 1e+06; }
  / "k" { return 1e+03; }
  / "m" { return 1e-03; }
  / "u" { return 1e-06; }
  / "µ" { return 1e-06; }
  / "n" { return 1e-09; }
  / "p" { return 1e-12; }

Digit
  = [0-9]

LineEnd "line separator"
  = [\n]
    { return null; }

_ "whitespace"
  = [ \t]* ( "#" [^\n]* )? ( [\n] [ \t]+ )?
    { return null; }

nl
  = "\n"
  / "\r\n"
  / "\r"
