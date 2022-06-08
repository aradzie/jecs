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
  = deviceId:Identifier instanceId:( ":" @Identifier )?
    _ nodes:NodeList
    _ modelId:ModelIdentifier?
    _ properties:PropertyList
    _ LineEnd
    {
      return {
        type: "instance",
        deviceId,
        modelId,
        instanceId,
        nodes,
        properties,
      };
    }

ModelIdentifier
  = "@" @Identifier

NodeList
  = ids:( _ @NodeIdentifier )+
    { return ids; }

NodeIdentifier
  = @Identifier !( _ "=" )

PropertyList
  = properties:( _ @Property )*
    { return properties; }

Property
  = id:Identifier _ "=" _ value:PropertyValue
    { return { id, value }; }

PropertyValue
  = value:String
    { return { type: "string", value }; }
  / value:Expression
    { return { type: "exp", value }; }

ModelItem
  = ".model"
    _ deviceId:Identifier
    _ modelId:ModelIdentifier
    _ properties:PropertyList
    _ LineEnd
    { return { type: "model", deviceId, modelId, properties }; }

EquationItem
  = ".eq" _ id:Variable _ "=" _ value:Expression _ LineEnd
    { return { type: "equation", id, value, }; }

ActionItem
  = DcAnalysisItem
  / TranAnalysisItem

DcAnalysisItem
  = ".dc" _ properties:PropertyList sweeps:( _ @Sweep )* _ LineEnd
    { return { type: "dc", properties, sweeps }; }

TranAnalysisItem
  = ".tran" _ properties:PropertyList sweeps:( _ @Sweep )* _ LineEnd
    { return { type: "tran", properties, sweeps }; }

Sweep
  = "sweep" _ variable:Variable _ from:Number _ to:Number _ points:Number
    { return { type: "sweep", variable, from, to, points } }

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
    { return { type: "unary", op, arg }; }
  / PrimaryExp

PrimaryExp
  = "(" _ @Expression _ ")"
  / LiteralExp
  / VarExp
  / FuncExp

LiteralExp
  = value:Number
    { return { type: "literal", value }; }

VarExp
  = id:Variable
    { return { type: "var", id }; }

FuncExp
  = id:Identifier _ args:Args
    { return { type: "func", id, args }; }

Args
  = "(" _ args:( _ @Expression )* _ ")"
    { return args; }

Variable "variable"
  = $( "$" [_a-zA-Z] [_a-zA-Z0-9]* )
    { return { name: text()/*, location: location()*/ }; }

Identifier "identifier"
  = $( [_a-zA-Z] [_a-zA-Z0-9]* )
    { return { name: text()/*, location: location()*/ }; }

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
