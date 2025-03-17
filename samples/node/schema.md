Type: `object`

*path: #*

&#36;schema: [http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)

***Properties***

 - <b id="propertiesbilling-address">billing_address</b>
	 - <i id="propertiesbilling-address">path: #/properties/billing_address</i>
	 - &#36;ref: [#/definitions/address](#/definitions/address)
 - <b id="propertiesshipping-address">shipping_address</b>
	 - <i id="propertiesshipping-address">path: #/properties/shipping_address</i>
	 - &#36;ref: [#/definitions/address](#/definitions/address)
# definitions

***address***

 - Type: `object`
 - <i id="definitionsaddress">path: #/definitions/address</i>
 - ***Properties***
	 - <b id="definitionsaddresspropertiesstreet-address">street_address</b> `required`
		 - Type: `string`
		 - <i id="definitionsaddresspropertiesstreet-address">path: #/definitions/address/properties/street_address</i>
	 - <b id="definitionsaddresspropertiescity">city</b> `required`
		 - Type: `string`
		 - <i id="definitionsaddresspropertiescity">path: #/definitions/address/properties/city</i>
	 - <b id="definitionsaddresspropertiesstate">state</b> `required`
		 - Type: `string`
		 - <i id="definitionsaddresspropertiesstate">path: #/definitions/address/properties/state</i>

*Generated with [OntoDevelopment/json-schema-doc](https://github.com/OntoDevelopment/json-schema-doc)* _Sun Mar 16 2025 21:39:17 GMT-0700 (Mountain Standard Time)_