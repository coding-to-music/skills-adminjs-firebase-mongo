const httpStatus = require("http-status");
const catchAsync = require("../helpers/catchAsync");

const { domainService } = require("../services/index");

const createDomain = catchAsync(async(req,res,next)=>{
    const { domainData } = req
    
    const createdDomain = domainService.createDomains(domainData);

    return res.status(httpStatus.CREATED).json({
		code: httpStatus.CREATED,
		status: httpStatus[httpStatus.OK],
		message: "New Domain created",
		data: createdDomain,
	});
});


const updateDomain = catchAsync(async (req,res,next)=>{
    const {domainData} = req

    const updatedDomain = domainService.updateDomain(domainData);

    return res.status(httpStatus.CREATED).json({
		code: httpStatus.CREATED,
		status: httpStatus[httpStatus.OK],
		message: "Domain updated",
		data: updatedDomain,
	});

});


const readDomain = catchAsync(async (req,res,next)=>{
    const { domainReq } = req;  // change it to whatever domain request field is in the request

    const domainInfo = domainService.readDomain(domainReq);

    return res.status(httpStatus.FOUND).json({
		code: httpStatus.FOUND,
		status: httpStatus[httpStatus.OK],
		message: "Domain found",
		data: domainInfo,
	});
})


module.exports = {createDomain , updateDomain, readDomain}