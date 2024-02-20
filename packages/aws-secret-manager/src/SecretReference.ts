export interface SecretReference {
	secretName: string;
	property?: string;
}

export namespace SecretReference {
	export function computeDescription({ secretName, property }: SecretReference) {
		return `Secret name: ${secretName}${property ? `, property: ${property}` : ""}`;
	}
}
