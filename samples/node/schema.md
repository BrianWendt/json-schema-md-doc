&#36;schema: [http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)

&#36;comment: _version 0.1.4_

Type: `object`

**_Properties_**

 - <i id="/billing_address">billing_address</i>
	 - <i id="/billing_address">path: /billing_address</i>
	 - &#36;ref: [#/definitions/address](#/definitions/address)
 - <i id="/shipping_address">shipping_address</i>
	 - <i id="/shipping_address">path: /shipping_address</i>
	 - &#36;ref: [#/definitions/address](#/definitions/address)
# definitions

 - <i id="/definitions/address">path: /definitions/address</i>
 - Type: `object`
 - **_Properties_**
	 - <i id="/definitions/address/street_address">address&thinsp;.&thinsp;street_address</i>
		 - <i id="/definitions/address/street_address">path: /definitions/address/street_address</i>
		 - Type: `string`
	 - <i id="/definitions/address/city">address&thinsp;.&thinsp;city</i>
		 - <i id="/definitions/address/city">path: /definitions/address/city</i>
		 - Type: `string`
	 - <i id="/definitions/address/state">address&thinsp;.&thinsp;state</i>
		 - <i id="/definitions/address/state">path: /definitions/address/state</i>
		 - Type: `string`

_Generated with [json-schema-md-doc](https://brianwendt.github.io/json-schema-md-doc/)_

`Documentation Generated Thu Apr 18 2019 23:09:23 GMT-0700 (Mountain Standard Time)`