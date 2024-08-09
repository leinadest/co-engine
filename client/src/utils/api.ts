export async function fetchData(url: string, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
}
