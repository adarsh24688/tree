

//Database link :- http://172.105.54.245:1200/app/family_tree/family_tree/users/view/1#

async function getDes(id){
	var testData =  await realModel.aggregate([
		{$match: {"memberId":id}},
		{$lookup: {from: "users", localField: "memberId", foreignField: "_id", as: "udata"}},
		{$lookup: {from: "users", localField: "children", foreignField: "_id", as: "cdata"}},
		{$lookup: {from: "users", localField: "wife", foreignField: "_id", as: "wifes"}},
	]);
	// console.log("<======1") RUN KRUk rukk ok done wait kr run ok kr run ok function call mai ja kr run ok
	if(testData[0].udata.length >0){		
		t = {}
		t.name = testData[0].udata[0].name
		t.email = testData[0].udata[0].email_id
		t.id = testData[0].udata[0]._id
		t.children = []		
		console.log("1<========="); 
		if (testData[0].cdata.length > 0) {	
			console.log("2<=========");				
			async.eachSeries(testData[0].cdata, (item, cb) => {
				console.log("3<=========");
				getDes(item._id).then(data => {
					t.children.push(data);
					cb();
				});
			})
			.then(success => {
				console.log(t,"<for loop completed======t");
				return t;
			});
		} else {				
			console.log(t,"<======t");
			return t;
		}
 
	} else {
		console.log("None<=========");
		return;
	}	
}	


var roots = []
async function getDes1(id,roots=[]){

	var testData =  await realModel.aggregate([
		{$match: {"memberId":id}},
		{$lookup: {from: "users", localField: "memberId", foreignField: "_id", as: "udata"}},
		{$lookup: {from: "users", localField: "children", foreignField: "_id", as: "cdata"}},
		{$lookup: {from: "users", localField: "wife", foreignField: "_id", as: "wifes"}},
		]);
		console.log("<======1")
		if(testData[0].udata.length >0){
			console.log("<======2")
			t = {}
			t.name = testData[0].udata[0].name
			t.email = testData[0].udata[0].email_id
			t.id = testData[0].udata[0]._id
			t.children = []
			roots.push(t);
			console.log(testData[0].cdata.length,"<=========name")
			if (testData[0].cdata.length > 0) {
				for(i=0; i< testData[0].cdata.length;i++){
					console.log(testData[0].cdata[i  ].name,"<=========3")
					var chilData = testData[0].cdata[i];
					if(roots.length > 0){
					   var gdata = await getDes(chilData._id, roots.find( element => element.id == testData[0].udata[0]._id ).children)
					}else{
						console.log("el")	
						var a ={
							name:chilData.name,
							emailL:chilData.email_id,
							id:chilData._id,
							children:[]
						}
						roots.push(a);//run ok Error aaya wait
						const gdata = await getDes(chilData._id,roots.find( element => element.id === a.id ).children)
					}
				}
		    }
		 	//  console.log(t,"<======t")
			// return t; 
	    }    
	console.log(roots,"<=")
	console.log("Function ")
	return roots;
}



exports.getData =async (req,res)=>{
	waterfall([
        function(callback){
            if(req.body.userId   ){
                callback(null, req.body);
            }else{
                callback(constant.PARAMETER_MISSING,[])
            }        
        },
        function(params,callback){
		    async function test(id){
			   var a = await realModel.findOne({children:mongoose.Types.ObjectId(id) })
				.then(async (data)=>{				
					
					if(data  !== null){
						if(data.memberId !== null || data.memberId !== ""){
								await test(data.memberId)
						}else{
							return data.memberId
						}
					}else{
						callback(null,id)
					}	
				})			  
           }	test(params.userId)
        },
      async function(params,callback){
       		
	     	var newid= params;
	       	var roots = [];
	       	var count = 0;
        	var result = await getDes(newid,roots);        	
        	console.log(result,"<=result");
        	callback(null, result); 
	       	
        },        
        ], function (err, result) {
        if(!err){
            
            res.json({
                code:200,
                status:1,
                message: constant.ACTIVATE_ACCOUNT,
                data:result
            });
        }else{
            res.json({
            code:200,
            status:0,
            message: err
            });
        }
    });
	
}