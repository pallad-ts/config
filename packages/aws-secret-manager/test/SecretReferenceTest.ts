import { SecretReference } from "@src/SecretReference";

describe("SecretReference", () => {
	it.each<[SecretReference]>([
		[
			{
				secretName: "s1",
			},
		],
		[
			{
				secretName: "s2",
				property: "p2",
			},
		],
	])("description %#", ref => {
		expect(SecretReference.computeDescription(ref)).toMatchSnapshot();
	});
});
