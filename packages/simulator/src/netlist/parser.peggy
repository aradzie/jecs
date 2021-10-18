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
  = properties:( @Property )*
  { return properties; }

Property
  = _ name:Identifier _ "=" _ value:Expression
  { return { name, value }; }

Equation
  = ".eq" _ name:Variable _ "=" _ value:Expression _ ";"
  { return { type: "equation", name, value, }; }

Action
  = ( ".dc" / ".sweep" ) _ ";"
  { return { type: "action" }; }

Expression
  = AdditiveExpression

AdditiveExpression
  = head:MultiplicativeExpression
    tail:( _ ( "+" / "-" ) _ MultiplicativeExpression )*
  { return binaryExp(head, tail); }

MultiplicativeExpression
  = head:ExponentiationExpression
    tail:( _ ( "*" / "/" ) _ ExponentiationExpression )*
  { return binaryExp(head, tail); }

ExponentiationExpression
  = head:UnaryExpression
    tail:( _ ( "^" ) _ UnaryExpression )*
  { return binaryExp(head, tail); }

UnaryExpression
  = op:( "-" / "+" ) _ arg:UnaryExpression
    { return { type: "unary", op, arg }; }
  / PrimaryExpression

PrimaryExpression
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
