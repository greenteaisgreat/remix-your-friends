import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { ContactRecord, getContact } from "../data";

import type { FunctionComponent } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // invariant asserts truthiness to make typescript stop yelling,
  // as well as throw custom error messages when you anticipate errors
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);

  // uncomment this line below and see what it solves; it kills two birds
  // with one stone by accounting for a null value and sending a web response;
  // this also makes it so that components in remix only focus on the "happy path"
  if (!contact) throw new Response("Not Found", { status: 404 });

  return json({ contact });
};

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
};
