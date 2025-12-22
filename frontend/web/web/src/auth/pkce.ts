const CHARSET: string =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

export function generateRandomString(length: number): string {

  const randomValues: Uint8Array = new Uint8Array(length);


  crypto.getRandomValues(randomValues);

  let result: string = '';

  for (let i = 0; i < randomValues.length; i++) {

    const index: number = randomValues[i] % CHARSET.length; //к этому есть вопросики

    result += CHARSET.charAt(index);
  }

  return result;
}


export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {

  const encoder: TextEncoder = new TextEncoder();
  const data: Uint8Array = encoder.encode(codeVerifier);


  const hashBuffer: ArrayBuffer = await crypto.subtle.digest(
    'SHA-256',
    data.buffer
  );

  const hashArray: Uint8Array = new Uint8Array(hashBuffer);

  let binaryString: string = '';

  for (let i = 0; i < hashArray.length; i++) {
    binaryString += String.fromCharCode(hashArray[i]);
  }

  const base64: string = btoa(binaryString);

  const base64Url: string = base64
    .replace(/\+/g, '-') 
    .replace(/\//g, '_') 
    .replace(/=+$/, ''); 

  return base64Url;
}
