import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pin}`
    );

    const data = await response.json();

    if (
      !data ||
      data[0].Status !== "Success" ||
      !data[0].PostOffice?.length
    ) {
      return NextResponse.json(
        {
          error: "Invalid PIN Code",
        },
        { status: 404 }
      );
    }

    const office = data[0].PostOffice[0];

    return NextResponse.json({
      town: office.Name,
      city: office.District,
      state: office.State,
      country: office.Country,
    });

  } catch (error: unknown) {
  console.error("PIN API ERROR:", error);

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unknown error",
    },
    {
      status: 500,
    }
  );
}
}