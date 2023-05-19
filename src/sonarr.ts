/**
 * Contains all the methods required to interact with Sonarr API, as it relates to this project.
 *
 * @author Jess Latimer @manybothans
 *
 * @todo Define types for requests and responses.
 *
 * @remarks
 * Sonarr API docs available at https://sonarr.tv/docs/api/
 */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { error } from "console";
// import _ from "lodash";
import dotenv from "dotenv";
dotenv.config();

/**
 * @typedef {Dictionary} Dictionary - Creates a new type for objects with unknown properties, e.g. responses from undocumented 3rd party APIs.
 */
interface Dictionary {
	[key: string]: unknown | Dictionary;
}

interface SonarrTag {
	id: number;
	label: string;
}
interface SonarrImage {
	coverType: string;
	url: string;
	remoteUrl: string;
}
interface SonarrStatistics {
	seasonCount?: number;
	episodeFileCount: number;
	episodeCount: number;
	totalEpisodeCount: number;
	sizeOnDisk: number;
	releaseGroups: Array<string>;
	percentOfEpisodes: number;
}
interface SonarrSeriesSeasons {
	seasonNumber: number;
	monitored: boolean;
	statistics: SonarrStatistics;
}
interface SonarrAltTitles {
	title: string;
	seasonNumber: number;
}
interface SonarrRatings {
	votes: number;
	value: number;
}
interface SonarrSeriesDetails {
	title: string;
	alternateTitles: Array<SonarrAltTitles>;
	sortTitle: string;
	status: string;
	ended: boolean;
	overview: string;
	previousAiring: string;
	network: string;
	airTime: string;
	images: Array<SonarrImage>;
	seasons: Array<SonarrSeriesSeasons>;
	year: number;
	path: string;
	qualityProfileId: number;
	languageProfileId: number;
	seasonFolder: boolean;
	monitored: boolean;
	useSceneNumbering: boolean;
	runtime: number;
	tvdbId: number;
	tvRageId: number;
	tvMazeId: number;
	firstAired: string;
	seriesType: string;
	cleanTitle: string;
	imdbId: string;
	titleSlug: string;
	rootFolderPath: string;
	certification: string;
	genres: Array<string>;
	tags: Array<number>;
	added: string;
	ratings: SonarrRatings;
	statistics: SonarrStatistics;
	id: number;
}

/**
 * This is the top-level SonarrAPI singleton object.
 */
const SonarrAPI = {
	/**
	 * Get the health of Radarr server.
	 *
	 * @return {Promise<Array<Dictionary>>} Returns the health status of the Radarr server instance.
	 */
	getHealth: async function (): Promise<Array<Dictionary>> {
		const data = await this.callApi({ url: "/health" });
		this.debug(data);
		return data;
	},
	/**
	 * Get a list of all the tags configured on the server.
	 *
	 * @return {Promise<Array<RadarrTag>>} Returns the list of tags from the server.
	 */
	getTags: async function (): Promise<Array<SonarrTag>> {
		const data = await this.callApi({ url: "/tag" });
		this.debug(data);
		return data;
	},
	/**
	 * Create a new tag.
	 *
	 * @param {string} tag - The string label for the new tag to create.
	 *
	 * @return {Promise<RadarrTag>} Returns the label and ID of the new tag.
	 */
	createTag: async function (tag: string): Promise<SonarrTag> {
		const data = await this.callApi({
			url: "/tag",
			method: "post",
			data: {
				label: tag
			}
		});
		this.debug(data);
		return data;
	},
	/**
	 * Get the details for a given media item.
	 *
	 * @param {number} itemId - The ID of the media item you want.
	 *
	 * @return {Promise<SonarrSeriesDetails>} Returns the details of the media item.
	 */
	getMediaItem: async function (
		itemId: number
	): Promise<SonarrSeriesDetails> {
		const data = await this.callApi({
			url: "/series/" + itemId
		});
		this.debug(data);
		return data;
	},
	/**
	 * Abstracted API calls to Sonarr, adds URL and API Key automatically.
	 *
	 * @param {AxiosRequestConfig} requestObj - The Axios request config object detailing the desired HTTP request.
	 *
	 * @return {Promise<Dictionary>} The data portion of the response from the Axios HTTP request, or NULL if request failed.
	 */
	callApi: async function (
		requestObj: AxiosRequestConfig
	): Promise<Dictionary> {
		if (!process.env.SONARR_URL || !process.env.SONARR_API_KEY) {
			throw error(
				"Missing .env file containing SONARR_URL and/or SONARR_API_KEY. See README.md"
			);
		}
		try {
			requestObj = requestObj || {};
			requestObj.baseURL = process.env.SONARR_URL + "/api/v3";
			requestObj.params = requestObj.params || {};
			requestObj.headers = {
				"X-Api-Key": process.env.SONARR_API_KEY
			};
			requestObj.method = requestObj.method || "get";

			const response: AxiosResponse = await axios.request(requestObj);
			// this.debug(response);
			return response?.data;
		} catch (error) {
			console.error(error);
			return null;
		}
	},
	/**
	 * Debugger helper function. Only prints to console if NODE_ENV in .env file is set to "development".
	 *
	 * @param {unknown} data - Anything you want to print to console.
	 *
	 * @return None.
	 */
	debug: function (data: unknown) {
		if (process.env.NODE_ENV == "development") {
			console.log(data);
		}
	}
};

export default SonarrAPI;
/*
Series Object
{
  title: 'The X-Files',
  alternateTitles: [
    { title: 'X-Files', seasonNumber: -1 },
    { title: 'Akte X', seasonNumber: -1 },
    { title: 'X-Files : Aux frontieres du reel', seasonNumber: -1 },
    { title: 'Expediente X', seasonNumber: -1 }
  ],
  sortTitle: 'xfiles',
  status: 'ended',
  ended: true,
  overview: "`The truth is out there,' and FBI agents Scully and Mulder seek it in this sci-fi phenomenon about their quest to explain the seemingly unexplainable. Their strange cases include UFO sightings, alien abductions and just about anything else paranormal.",
  previousAiring: '2018-03-22T00:00:00Z',
  network: 'FOX',
  airTime: '20:00',
  images: [
    {
      coverType: 'banner',
      url: '/MediaCover/133/banner.jpg?lastWrite=638102862660990861',
      remoteUrl: 'https://artworks.thetvdb.com/banners/graphical/61-g.jpg'
    },
    {
      coverType: 'poster',
      url: '/MediaCover/133/poster.jpg?lastWrite=638012029348167995',
      remoteUrl: 'https://artworks.thetvdb.com/banners/posters/77398-2.jpg'
    },
    {
      coverType: 'fanart',
      url: '/MediaCover/133/fanart.jpg?lastWrite=638102862662020870',
      remoteUrl: 'https://artworks.thetvdb.com/banners/fanart/original/77398-4.jpg'
    }
  ],
  seasons: [
    {
    seasonNumber: 0,
    monitored: false,
    statistics: {
      episodeFileCount: 0,
      episodeCount: 0,
      totalEpisodeCount: 7,
      sizeOnDisk: 0,
      releaseGroups: [],
      percentOfEpisodes: 0
    }
  }
  ],
  year: 1993,
  path: '/data/TV Shows/The X-Files',
  qualityProfileId: 7,
  languageProfileId: 1,
  seasonFolder: true,
  monitored: true,
  useSceneNumbering: false,
  runtime: 45,
  tvdbId: 77398,
  tvRageId: 6312,
  tvMazeId: 430,
  firstAired: '1993-09-10T00:00:00Z',
  seriesType: 'standard',
  cleanTitle: 'thexfiles',
  imdbId: 'tt0106179',
  titleSlug: 'the-x-files',
  rootFolderPath: '/data/TV Shows/',
  certification: 'TV-14',
  genres: [
    'Crime',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Science Fiction',
    'Suspense',
    'Thriller'
  ],
  tags: [],
  added: '2022-10-12T19:54:00.807484Z',
  ratings: { votes: 0, value: 0 },
  statistics: {
    seasonCount: 11,
    episodeFileCount: 217,
    episodeCount: 217,
    totalEpisodeCount: 225,
    sizeOnDisk: 83327787182,
    releaseGroups: [
      'Sum',        'Modern',
      'COPS',       'd3g',
      'Obfuscated', 'D',
      'Monster',    'SHORTBREHD'
    ],
    percentOfEpisodes: 100
  },
  id: 133
}

*/
