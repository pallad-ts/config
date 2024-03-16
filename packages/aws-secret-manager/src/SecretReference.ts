export interface SecretReference {
	name: string;
	property?: string;
}

export namespace SecretReference {
	export function computeDescription({ name, property }: SecretReference) {
		return `Secret name: ${name}${property ? `, property: ${property}` : ""}`;
	}
}
