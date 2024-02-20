import { Domain, ErrorDescriptor, formatCodeFactory } from "@pallad/errors";

export const errorsDomain = new Domain();

const code = formatCodeFactory("E_CONF_SECRET_MANAGER_%c");
export const ERRORS = errorsDomain.addErrorsDescriptorsMap({
	CANNOT_EXTRACT_PROPERTY_FROM_NON_OBJECT: ErrorDescriptor.useDefaultMessage(
		code(1),
		"Cannot extract property from non-object"
	),
	MISCONFIGURED_DATALOADER: ErrorDescriptor.useMessageFormatter(
		code(2),
		(batchSize: number) => `Misconfigured dataloader. Missing required "maxBatchSize: ${batchSize}" option`
	),
});
