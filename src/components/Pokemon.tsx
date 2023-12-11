import { useEffect, useState } from "react";
import { Button, Card, Col, Tab, Tabs } from "react-bootstrap";
import { Star, StarFill } from 'react-bootstrap-icons';
import { LS_KEY, getStarList } from "../utils";

export interface PokemonDetails {
    id: number
    name: string;
    url: string;
    height: number;
    weight: number;
    sprites: { front_default: string };
    types: { type: { name: string } }[];
    abilities: { ability: { name: string } }[];
    base_experience: number;
    stats: { base_stat: number; stat: { name: string } }[];
    species: { name: string };
}

export default (pokemon: PokemonDetails) => {
    const [, setStar] = useState<number[]>([])

    useEffect(() => {
        setStar(getStarList())
    }, [])

    return (
        <Col className='col-12 col-sm-6 col-md-4 col-lg-3'>
            <Card className="mb-3 h-100">
                <Card.Img variant="top" src={pokemon.sprites.front_default} />
                <Card.Body>
                    <Card.Title className="text-capitalize">{pokemon.name}</Card.Title>
                    <Card.Text>
                        <strong>Height:</strong> {pokemon.height} | <strong>Weight:</strong> {pokemon.weight}
                    </Card.Text>
                    <Tabs defaultActiveKey="details" id="pokemon-details">
                        <Tab eventKey="details" title="Details">
                            <Card.Text>
                                <strong>Base Experience:</strong> {pokemon.base_experience}
                            </Card.Text>
                            <Card.Text>
                                <strong>Types:</strong> {pokemon.types.map((type) => type.type.name).join(', ')}
                            </Card.Text>
                            <Card.Text>
                                <strong>Abilities:</strong> {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}
                            </Card.Text>
                        </Tab>
                        <Tab eventKey="stats" title="Stats">
                            {pokemon.stats.map((stat) => (
                                <Card.Text key={stat.stat.name}>
                                    <strong>{stat.stat.name}:</strong> {stat.base_stat}
                                </Card.Text>
                            ))}
                        </Tab>
                        <Tab eventKey="species" title="Species">
                            <Card.Text>
                                <strong>Species:</strong> {pokemon.species.name}
                            </Card.Text>
                            <Card.Text>
                                <strong>Flavor Text:</strong> Loading...
                            </Card.Text>
                        </Tab>
                    </Tabs>
                    <Button className="mt-2" variant="primary" onClick={() => {
                        const oldStar = getStarList()

                        if (oldStar.includes(pokemon.id)) {
                            oldStar.splice(oldStar.indexOf(pokemon.id), 1)
                        } else {
                            oldStar.push(pokemon.id)
                            oldStar.sort((a, b) => a - b)
                        }

                        setStar(oldStar)
                        localStorage.setItem(LS_KEY, JSON.stringify(oldStar))
                    }}>
                        {
                            getStarList().includes(pokemon.id) ?
                                <StarFill style={{ color: 'yellow' }} /> :
                                <Star />
                        }
                    </Button>
                </Card.Body>
            </Card>
        </Col>
    )
}