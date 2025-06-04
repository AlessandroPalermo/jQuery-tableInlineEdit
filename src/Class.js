(function(){
	var initializing 	= false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	this.Class 			= function(){};// The base Class implementation (does nothing)

	Class.extend = function(prop)  {
		var _super 		= this.prototype;
		initializing 	= true;// 	Instantiate a base class (but only create the instance, don’t run the init constructor)
		var prototype 	= new this();
		initializing 	= false;

		// Copy the properties over onto the new prototype
		for (var name in prop)  {
			if( typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ) {
				prototype[name] = (function(name, fn){
					return function() {
						var tmp 	= this._super;
						this._super = _super[name];// Add a new ._super() method that is the same method  but on the super-class
						var ret 	= fn.apply(this, arguments);// 	The method only needs to be bound temporarily, so we remove it when we’re done executing
						this._super = tmp;
						return ret;
					};
				})(name, prop[name]) 
			} else {
				prototype[name] = prop[name];
			}
		}

		prototype.setOption = function(opt, val){
			this[opt] = val;
		};
		// The dummy class constructor
		function Class() 
		{
			// All construction is actually done in the init method
			if ( !initializing && this.construct )
				this.construct.apply(this, arguments);
		}

		Class.prototype 			= prototype;// Populate our constructed prototype object
		Class.prototype.constructor = Class;// Enforce the constructor to be what we expect
		Class.extend 				= arguments.callee;// 	And make this class extendable
		return Class;
	};
})();