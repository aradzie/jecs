// npx peggy --format es parser.peggy

{{
function binaryExp(head, tail) {
  return tail.reduce(
    (result, element) => ({
      type: "binary",
      op: element[1],
      a: result,
      b: element[3],
    }),
    head,
  );
}
}}

Netlist
  = items:( _ @Item )* _
    { return { items }; }

Item =
  Definition
  / Equation
  / Action

Definition
  = deviceId:Identifier id:( ":" @Identifier )?
    _ nodes:NodeList
    _ properties:PropertyList
    _ ";"
    {
      return {
        type: "definition",
        deviceId,
        id,
        nodes,
        properties,
      };
    }

NodeList
  = "[" ids:( _ @Identifier )+ _ "]"
    { return ids; }

PropertyList
  = properties:( _ @Property )*
    { return properties; }

Property
  = name:Identifier _ "=" _ value:PropertyValue
    { return { name, value }; }

PropertyValue
  = value:String
    { return { type: "string", value }; }
  / value:Expression
    { return { type: "exp", value }; }

Equation
  = ".eq" _ name:Variable _ "=" _ value:Expression _ ";"
    { return { type: "equation", name, value, }; }

Action
  = ( ".dc" / ".sweep" ) _ ";"
    { return { type: "action" }; }

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
    { return { id: text()/*, location: location()*/ }; }

Identifier "identifier"
  = $( [_a-zA-Z] [_a-zA-Z0-9]* )
    { return { id: text()/*, location: location()*/ }; }

String
  = '"' chars:$( !( '"' / "\n" / "\r" ) . )* '"'
    { return chars; }

Number "number"
  = $( "-"? Integer Frac? Exp? )
    { return Number.parseFloat(text()); }

Integer
  = Digit+

Frac
  = "." Digit+

Exp
  = ( "e" / "E" ) ( "-" / "+" )? Digit+

Digit
  = [0-9]

_ "whitespace"
  = [ \t\n\r]*
