export interface SecretReference {
	name: string;
	property?: string;
}

export namespace SecretReference {
	export function computeDescription({ name, property }: SecretReference) {
		return `AWS Secret Manager secret name: ${name}${property ? `, property: ${property}` : ""}`;
	}
}
