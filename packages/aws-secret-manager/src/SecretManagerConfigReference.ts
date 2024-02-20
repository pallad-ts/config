export interface SecretManagerConfigReference {
	secretName: string;
	property?: string;
}


export namespace SecretManagerConfigReference {
	export function computeDescription({secretName, property}: SecretManagerConfigReference) {
		return `Secret name: ${secretName}${property ? `, property: ${property}` : ''}`;
	}
}
