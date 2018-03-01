const internal = {
    state: {}
};

module.exports ={
    set: function(newState){
        internal.state = newState;
    },
    get: function(){
        return internal.state;
    }
}
