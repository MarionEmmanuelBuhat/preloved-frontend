import utilcss from "../../utils/utils.module.css";
import css from "./collections.module.css";
import { useMediaQuery } from "react-responsive";
import NavBar, { MobileNavTop, MobileNavBottom } from "../fragments/nav-bar/nav-bar";
import { SubmitHandler, useForm } from "react-hook-form";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  create_collection,
  delete_collection,
  get_collection,
  remove_item_from_collection,
  rename_collection,
} from "../../utils/collections";
import loading from "../../assets/loading.gif";
import { useNavigate } from "react-router-dom";

interface IFormInput {
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  created_at: string;
  img_ids: string[];
  img_links: string[];
}

export const resultAtom = atom<string>(""); // success, failed
export const showModalAtom = atom<string>("");
export const collectionsAtom = atom<any>(null);
export const collectionDataAtom = atom<{ name: string; id: number } | null>(null);

const fetch_collection = async () => {
  return await get_collection();
};

const RemoveItemModal = ({
  collectionID,
  itemID,
  img_link,
}: {
  collectionID: string;
  itemID: string;
  img_link: string;
}) => {
  const navigate = useNavigate();
  const [fetching, setFetching] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const setShowModal = useSetAtom(showModalAtom);
  const setCollections = useSetAtom(collectionsAtom);

  const delete_item = async () => {
    setFetching(true);
    setResult(await remove_item_from_collection(collectionID, itemID));
    setFetching(false);
    setCollections(fetch_collection());
  };

  const nav = () => {
    setShowModal("");
    navigate(`/item/${itemID}`);
  };

  return (
    <div className={css.modal_container}>
      <div className={css.dialog_container}>
        <div className={css.dialog_header}>
          <h2>Remove or Navigate</h2>
        </div>
        <div className={css.dialog_body}>
          <img src={img_link} onClick={nav} className={`${css.image} ${css.image_display}`} />
          <div className={css.buttons}>
            {fetching && <img src={loading} className={css.loading} />}
            {result !== "success" && !fetching && (
              <>
                <button
                  onClick={delete_item}
                  className={`${css.primary_button} ${css.modal_button}`}
                >
                  Remove
                </button>
                <button
                  onClick={() => setShowModal("")}
                  className={`${css.secondary_button} ${css.modal_button}`}
                >
                  Close
                </button>
              </>
            )}
            {result === "success" && (
              <button onClick={() => setShowModal("")} className={css.primary_button}>
                Close
              </button>
            )}
          </div>
        </div>
        <div className={css.dialog_footer}>
          {result === "success" && <p className={css.form_success}>Item removed from collection</p>}
          {result === "failed" && (
            <p className={css.form_error}>Failed removing item from collection</p>
          )}
        </div>
      </div>
    </div>
  );
};

const RenameCollectionModal = ({ name, id }: { name: string; id: number }) => {
  const [fetching, setFetching] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const setShowModal = useSetAtom(showModalAtom);
  const setCollections = useSetAtom(collectionsAtom);
  const newName = useRef<string>("");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (form) => {
    setFetching(true);
    setResult(await rename_collection(String(id), form.name));
    newName.current = form.name;
    setFetching(false);
    setCollections(await fetch_collection());
  };

  return (
    <div className={css.modal_container}>
      <div className={css.dialog_container}>
        <div className={css.dialog_header}>
          <h2>Rename {result === "success" ? newName.current : name}</h2>
        </div>
        <div className={css.dialog_body}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              className={css.form_input}
              {...register("name", { required: true })}
              placeholder="Vintage Clothes"
            />
            {fetching ? (
              <>
                <img src={loading} className={css.loading} />
              </>
            ) : (
              <>
                <div className={css.buttons}>
                  <input
                    className={`${css.primary_button} ${css.modal_button}`}
                    type="submit"
                    value="Rename"
                  />
                  <button
                    onClick={() => setShowModal("")}
                    className={`${css.secondary_button} ${css.modal_button}`}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
        <div className={css.dialog_footer}>
          {errors.name && <p className={css.form_error}>Collection name is required</p>}
          {result === "success" && (
            <p className={css.form_success}>Collection renamed successfully</p>
          )}
          {result === "failed" && <p className={css.form_error}>Failed renaming collection</p>}
        </div>
      </div>
    </div>
  );
};

const DeleteCollectionModal = ({ name, id }: { name: string; id: number }) => {
  const [fetching, setFetching] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const setShowModal = useSetAtom(showModalAtom);
  const setCollections = useSetAtom(collectionsAtom);

  const deleteCollection = async () => {
    setFetching(true);
    setResult(await delete_collection(String(id)));
    setFetching(false);
    setCollections(await fetch_collection());
  };

  return (
    <div className={css.modal_container}>
      <div className={css.dialog_container}>
        {result !== "success" && (
          <div className={css.dialog_header}>
            <h2>Are you sure you want to delete {name}?</h2>
          </div>
        )}
        <div className={css.buttons}>
          {result !== "success" && fetching === false && (
            <>
              <button
                onClick={deleteCollection}
                className={`${css.primary_button} ${css.modal_button}`}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowModal("")}
                className={`${css.secondary_button} ${css.modal_button}`}
              >
                Close
              </button>
            </>
          )}
          {fetching && <img src={loading} className={css.loading} />}
          {result === "success" && (
            <button
              onClick={() => setShowModal("")}
              className={`${css.primary_button} ${css.modal_button}`}
            >
              Close
            </button>
          )}
        </div>
        <div className={css.dialog_footer}>
          {result === "success" && (
            <p className={css.form_success}>Collection deleted successfully</p>
          )}
          {result === "failed" && <p className={css.form_error}>Failed deleting collection</p>}
        </div>
      </div>
    </div>
  );
};

export const CreateCollectionModal = () => {
  const [fetching, setFetching] = useState<boolean>(false);
  const result = useAtomValue(resultAtom);
  const setResult = useSetAtom(resultAtom);
  const setShowModal = useSetAtom(showModalAtom);
  const setCollections = useSetAtom(collectionsAtom);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (form) => {
    setFetching(true);
    setResult(await create_collection(form.name));
    setFetching(false);
    setCollections(await fetch_collection());
  };

  const closeModal = () => {
    setShowModal("");
  };

  return (
    <div className={css.modal_container}>
      <div className={css.dialog_container}>
        <div className={css.dialog_header}>
          <h2>Collection Name</h2>
        </div>
        <div className={css.dialog_body}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              className={css.form_input}
              {...register("name", { required: true })}
              placeholder="Vintage Clothes"
            />
            {fetching ? (
              <>
                <img src={loading} className={css.loading} />
              </>
            ) : (
              <>
                <div className={css.buttons}>
                  <input
                    className={`${css.primary_button} ${css.modal_button}`}
                    type="submit"
                    value="Submit"
                  />
                  <button
                    onClick={closeModal}
                    className={`${css.secondary_button} ${css.modal_button}`}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
        <div className={css.dialog_footer}>
          {errors.name && <p className={css.form_error}>Collection name is required</p>}
          {result === "success" && (
            <p className={css.form_success}>Collection created successfully</p>
          )}
          {result === "failed" && <p className={css.form_error}>Error creating collection</p>}
        </div>
      </div>
    </div>
  );
};

function Collections() {
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [collectionData, setCollectionData] = useAtom(collectionDataAtom);
  const [itemData, setItemData] = useState<{
    collectionID: string;
    itemID: string;
    img_link: string;
  } | null>(null);

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-device-width: 1224px)",
  });

  useEffect(() => {
    setCollections(fetch_collection());
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal !== "" ? "hidden" : "unset";
  }, [showModal]);

  const create_modal = (modal: string) => {
    setShowModal(modal);
  };

  const set_data = (collection: Collection, modal: string) => {
    setCollectionData({ name: collection.name, id: collection.id });
    create_modal(modal);
  };

  const set_item_data = (collectionID: string, itemID: string, img_link: string, modal: string) => {
    setItemData({ collectionID, itemID, img_link });
    setShowModal(modal);
  };

  return (
    <>
      {isDesktopOrLaptop ? <NavBar /> : <MobileNavTop />}
      <div className={css.container}>
        <h1 className={css.page_title}>Collections</h1>
        <div
          className={`${css.secondary_button} ${css.create_button}`}
          onClick={() => create_modal("create")}
        >
          <h3>Create Collection</h3>
        </div>

        <div className={css.card_column}>
          {/* {collections === null && <img src={loading} className={`${css.loading} ${css.center}`} />} */}
          {collections === null && <div className={`${css.placeholder} ${utilcss.skeleton}`}></div>}
          {collections?.map((collection: Collection) => (
            <div className={css.card_container} key={collection.id}>
              <h3 className={css.collection_title}>{collection.name}</h3>
              <div className={css.images}>
                {collection.img_ids.map((imgId, imgIndex) => (
                  <img
                    onClick={() =>
                      set_item_data(
                        String(collection.id),
                        imgId,
                        collection.img_links[imgIndex],
                        "delete_item"
                      )
                    }
                    className={css.image}
                    src={collection.img_links[imgIndex]}
                    key={imgId}
                  />
                ))}
              </div>
              <div className={css.button_row}>
                <button
                  onClick={() => set_data(collection, "rename")}
                  className={css.secondary_button}
                >
                  Rename Collection
                </button>
                <button
                  onClick={() => set_data(collection, "delete")}
                  className={css.secondary_button}
                >
                  Delete Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {!isDesktopOrLaptop && <MobileNavBottom />}
      {showModal === "delete_item" && itemData && (
        <RemoveItemModal
          collectionID={itemData!.collectionID}
          itemID={itemData!.itemID}
          img_link={itemData!.img_link}
        />
      )}
      {showModal === "create" && <CreateCollectionModal />}
      {showModal === "delete" && (
        <DeleteCollectionModal name={collectionData!.name} id={collectionData!.id} />
      )}
      {showModal === "rename" && (
        <RenameCollectionModal name={collectionData!.name} id={collectionData!.id} />
      )}
    </>
  );
}

export default Collections;
