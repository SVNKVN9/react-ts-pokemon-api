import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { Container, Form, Pagination, Row, Spinner } from "react-bootstrap";
import Pokemon, { PokemonDetails } from "./Pokemon";
import { getStarList } from "../utils";

const POKEMON_PER_PAGE = 24

export const PokeList = () => {
    const [pokemonList, setPokemonList] = useState<PokemonDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0)
    const [showStarredOnly, setShowStarredOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("")
    const [SearchList, setSearcList] = useState<string[]>([])

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        const fetchData = async () => {
            try {
                setLoading(true)
                let data;
                let totalItems;

                if (SearchList.length > 0) {
                    if (showStarredOnly) {
                        const starList = getStarList();

                        const idx = SearchList.map((value) => parseInt(value.split('/')[6]))

                        data = (await Promise.all(
                            starList.map(async (id) => {
                                if (!idx.includes(id)) return

                                const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
                                return pokemonResponse.data;
                            })
                        )).filter((value) => value);

                        totalItems = 1;
                    } else {
                        data = await Promise.all(
                            SearchList.map(async (url) => {
                                const pokemonResponse = await axios.get(`${url}`);
                                return pokemonResponse.data;
                            })
                        );

                        totalItems = 1;
                    }
                } else {
                    if (showStarredOnly) {
                        const starList = getStarList();

                        data = await Promise.all(
                            starList.map(async (id) => {
                                const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
                                return pokemonResponse.data;
                            })
                        );

                        totalItems = 1;
                    } else {
                        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_PER_PAGE}&offset=${POKEMON_PER_PAGE * (currentPage - 1)}`);
                        const results = response.data.results as { name: string; url: string }[];

                        data = await Promise.all(
                            results.map(async (pokemon) => {
                                const pokemonResponse = await axios.get(pokemon.url);
                                return pokemonResponse.data;
                            })
                        );

                        totalItems = response.data.count;
                    }
                }

                setTotalPages(Math.ceil(totalItems / POKEMON_PER_PAGE));

                setPokemonList(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [currentPage, showStarredOnly, SearchList]);

    const getPageNumbers = () => {
        const pageNumbers = [];
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    const paginate = (pageNumber: number) => {
        setLoading(true)
        setCurrentPage(pageNumber)
    };

    const handleToggleStarredOnly = () => {
        setShowStarredOnly((prev) => !prev);
    };

    const handlerSearchTerm = async (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)

        if (!e.target.value) return setSearcList([])

        const resCount = await axios.get(`https://pokeapi.co/api/v2/pokemon`);
        const count = resCount.data.count

        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
        const result = res.data.results.filter((data: any) => data.name.includes(e.target.value.toLowerCase())).map((data: any) => data.url)

        setSearcList(result)
    }

    return (
        // <div className="bg-dark text-light">
        <div>
            <Container>
                <div className="pt-5">
                    <h2>Pokemon List</h2>
                </div>

                <Form className="mt-3 mb-3">
                    <Form.Group controlId="formSearch">
                        <Form.Control
                            type="text"
                            placeholder="Search Pokemon"
                            value={searchTerm}
                            onChange={handlerSearchTerm}
                        />
                    </Form.Group>
                </Form>

                <Form className="mb-3">
                    <Form.Check
                        onClick={handleToggleStarredOnly}
                        type="switch"
                        id="custom-switch"
                        label="Show only Star"
                    />
                </Form>

                {
                    loading ? (
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    ) : (
                        <div className="d-flex flex-column align-items-center">
                            <Row className="d-flex justify-content-center">
                                {
                                    pokemonList.map(({ abilities, height, name, id, sprites, types, url, weight, base_experience, species, stats }) =>
                                        <Pokemon
                                            key={name}
                                            abilities={abilities}
                                            height={height}
                                            name={name}
                                            id={id}
                                            sprites={sprites}
                                            types={types}
                                            url={url}
                                            weight={weight}
                                            base_experience={base_experience}
                                            species={species}
                                            stats={stats}
                                        />
                                    )
                                }
                            </Row>


                            <Pagination className="m-0 pb-5">
                                <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />

                                {currentPage > 3 && <Pagination.Item onClick={() => setCurrentPage(1)}>1</Pagination.Item>}
                                {currentPage > 4 && <Pagination.Ellipsis disabled />}

                                {
                                    getPageNumbers().map((number) => (
                                        <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                                            {number}
                                        </Pagination.Item>
                                    ))
                                }

                                {currentPage < totalPages - 3 && <Pagination.Ellipsis disabled />}
                                {currentPage < totalPages - 2 && (
                                    <Pagination.Item onClick={() => setCurrentPage(totalPages)}> {totalPages}</Pagination.Item>
                                )}

                                <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
                            </Pagination>
                        </div>
                    )
                }
            </Container>
        </div>
    )
}