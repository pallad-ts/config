import { SecretReference } from "@src/SecretReference";

describe("SecretReference", () => {
	it.each<[SecretReference]>([
		[
			{
				name: "s1",
			},
		],
		[
			{
				name: "s2",
				property: "p2",
			},
		],
	])("description %#", ref => {
		expect(SecretReference.computeDescription(ref)).toMatchSnapshot();
	});
});
