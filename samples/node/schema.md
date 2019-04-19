&#36;schema: [http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)

&#36;comment: _version 0.1.5_

Type: `object`

**_Properties_**

 - <i id="/properties/billing_address">billing_address</i>
	 - <i id="/properties/billing_address">path: /properties/billing_address</i>
	 - &#36;ref: [#/definitions/address](#/definitions/address)
 - <i id="/properties/shipping_address">shipping_address</i>
	 - <i id="/properties/shipping_address">path: /properties/shipping_address</i>
	 - &#36;ref: [#/definitions/address](#/definitions/address)
# definitions

 - <i id="/definitions/address">path: /definitions/address</i>
 - Type: `object`
 - **_Properties_**
	 - <i id="/definitions/address/properties/street_address">address&thinsp;.&thinsp;street_address</i>
		 - <i id="/definitions/address/properties/street_address">path: /definitions/address/properties/street_address</i>
		 - Type: `string`
	 - <i id="/definitions/address/properties/city">address&thinsp;.&thinsp;city</i>
		 - <i id="/definitions/address/properties/city">path: /definitions/address/properties/city</i>
		 - Type: `string`
	 - <i id="/definitions/address/properties/state">address&thinsp;.&thinsp;state</i>
		 - <i id="/definitions/address/properties/state">path: /definitions/address/properties/state</i>
		 - Type: `string`

_Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)_ _Thu Apr 18 2019 23:32:31 GMT-0700 (Mountain Standard Time)_